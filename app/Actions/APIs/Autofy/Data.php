<?php

namespace App\Actions\APIs\Autofy;

use App\Actions\Utils\ReverseTransaction;
use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\DataTransaction;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;


class Data
{

    public function handle(Transaction $transaction, DataTransaction $dataTransaction, TransactionApi $api = null)
    {
        $reverseTransaction = new ReverseTransaction();
        $client = new Client();


        $data = [
            // "network_id"=> $dataTransaction->network->api_network_id, //! api id from api
            "phone"=> $dataTransaction->phone_number,
            "plan_id"=> $dataTransaction->plan->api_plan_id,
        ];


        if(config('app.enable_standalone_api')){
            $apiToken = $api->token;
            $apiUrl = $api->url;
            $data['plan_id'] = $dataTransaction->plan->apis->where('transaction_api_id', $api->id)->first()->product_code;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }

        try {
            $response = $client->post("$apiUrl/api/data", [
                'headers' => [
                    'Authorization' => "Bearer $apiToken",
                    'Accept' => 'application/json',
                    'X-Requested-With' => 'XMLHttpRequest', // Add this line for X-Requested-With header
                ],
                'json' => $data,
                'withCredentials' => true, // Add this line for withCredentials option
            ]);


            $res = json_decode($response->getBody(), true);

            Log::info($res);

            if ($res['status'] === 'success') {

                $transaction->update([
                    'status'=> 'success',
                    'vending_medium'=> $api? $api->name : 'Autofy Api',
                    'api_response' => $res['api_response']?? 'Transaction Successfull'
                ]);

            }else{

                $transaction->update([
                    // 'status'=> 'success',
                    'vending_medium'=> $api? $api->name : 'Autofy Api',
                    'api_response' => $res['api_response']?? 'Transaction Successfull'
                ]);

            //  $reverseTransaction->handle($transaction, $res);

            }

        } catch (\Exception $e) {

            $reverseTransaction->handle($transaction);

            $error = $e->getMessage();

            Log::error($error);



            // $transaction->update([
            //     'api_response' => $api_response
            // ]);


        }

        return $transaction->status;
    }


}
