<?php

namespace App\Actions\APIs\SmartTech;

use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;
use App\Actions\Utils\ReverseTransaction;
use App\Models\CableSubscriptionTransaction;



class Cable
{



    public function handle(Transaction $transaction, CableSubscriptionTransaction $cableSubscriptionTransaction, TransactionApi $api = null)
    {
        $reverseTransaction = new ReverseTransaction();
        $client = new Client();

        $data = [
            "cable_name"=> $cableSubscriptionTransaction->network->code,
            "cable_subscription_plan_id"=> $cableSubscriptionTransaction->product_code,
            "smart_card_number"=> $cableSubscriptionTransaction->smart_card_number,
            "phone"=> $cableSubscriptionTransaction->phone_number,
        ];


        if(config('app.enable_standalone_api')){
            $apiToken = $api->token;
            $apiUrl = $api->url;
            $data['cable_subscription_plan_id'] = $cableSubscriptionTransaction->plan->apis->where('transaction_api_id', $api->id)->first()->product_code;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }


        try {
            $response = $client->post("$apiUrl/api/cable_subscription", [
                'headers' => [
                    'Authorization' => "Token $apiToken",
                    'Accept' => 'application/json',
                    'X-Requested-With' => 'XMLHttpRequest', // Add this line for X-Requested-With header
                ],
                'json' => $data,
                'withCredentials' => true, // Add this line for withCredentials option
            ]);


            $res = json_decode($response->getBody(), true);

            Log::info($res);

            if ($res['Status'] === 'successful') {

                $transaction->update([
                    'status'=> 'success',
                    'vending_medium'=> $api? $api->name : 'Default Api',
                    'api_response' => $res['api_response']?? 'Transaction Successfull'
                ]);

            }else{

             $reverseTransaction->handle($transaction, $res);

            }

        } catch (\Exception $e) {

            $reverseTransaction->handle($transaction);

            $error = $e->getMessage();

            Log::error($error );

        }


        return $transaction->status;
    }


}
