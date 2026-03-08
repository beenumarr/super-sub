<?php

namespace App\Actions\APIs\Default;

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
            "cablename"=> $cableSubscriptionTransaction->network->code,
            "cableplan"=>$cableSubscriptionTransaction->product_code,
            "smart_card_number"=> $cableSubscriptionTransaction->smart_card_number,
            "phone"=> $cableSubscriptionTransaction->phone_number,
        ];


        if(config('app.enable_standalone_api')){
            $apiToken = $api->token;
            $apiUrl = $api->url;
            $data['cableplan'] = $cableSubscriptionTransaction->plan->apis->where('transaction_api_id', $api->id)->first()->product_code;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }


        try {
            $response = $client->post("$apiUrl/api/cablesub/", [
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

            $pattern = '/response:\s+(.*?)$/i';
            preg_match($pattern, $error, $matches);
            $api_res = $matches[1] ?? [];

            $me = json_decode($api_res, true);

            if (isset($me['error'][0]) || isset($me['plan'][0])) {
                $errorMessage = $me['error'][0] ?? $me['plan'][0];

                if (strpos($errorMessage, "insufficient balance") !== false) {
                    $api_response = "Transaction Failed, Something went wrong!'";
                } else {
                    $api_response = $errorMessage;
                }
            } else {
                $api_response = "No error message found.";
            }

            $transaction->update([
                'api_response' => $api_response
            ]);


        }


        return $transaction->status;
    }


}
