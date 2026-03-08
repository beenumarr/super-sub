<?php

namespace App\Actions\APIs\ADE;

use App\Actions\Utils\ReverseTransaction;
use App\Models\AirtimeTransaction;
use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;


class Airtime
{

    public function handle(Transaction $transaction, AirtimeTransaction $airtimeTransaction, TransactionApi $api = null)
    {
        $reverseTransaction = new ReverseTransaction();
        $client = new Client();

        $data = [
            'network' => $airtimeTransaction->network->api_network_id,
            'phone' => $airtimeTransaction->phone_number,
            'plan_type' => 'VTU',
            "amount"=> (int) $airtimeTransaction->amount,
            'bypass' => true,
            'request-id' => $transaction->reference
        ];

        if(config('app.enable_standalone_api')){
            $apiToken = $api->token;
            $apiUrl = $api->url;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }


        try {
            $response = $client->post("$apiUrl/api/topup/", [
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

            if ($res['status'] === 'success') {

                $transaction->update([
                    'status'=> 'success',
                    'vending_medium'=> $api? $api->name : 'Default Api',
                    'api_response' => $res['message']?? 'Transaction Successfull'
                ]);

            }else{

             $reverseTransaction->handle($transaction);

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

                if (strpos($errorMessage, "You can't topup due to insufficient balance") !== false) {
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
