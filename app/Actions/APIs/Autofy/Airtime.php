<?php

namespace App\Actions\APIs\Autofy;

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
            "network"=> $airtimeTransaction->network->api_network_id, //! api id from api
            "phone_number"=> $airtimeTransaction->phone_number,
            "amount"=> $airtimeTransaction->amount,
        ];


        if(config('app.enable_standalone_api')){
            $apiToken = $api->token;
            $apiUrl = $api->url;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }

        try {
            $response = $client->post("$apiUrl/api/airtime", [
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
                    'vending_medium'=> $api? $api->name : 'Default Api',
                    'api_response' => $res['api_response']?? 'Transaction Successfull'
                ]);

            }else{

             $reverseTransaction->handle($transaction);

            }

        } catch (\Exception $e) {

            $reverseTransaction->handle($transaction);

            $error = $e->getMessage();

            Log::error($error);


        }

        return $transaction->status;
    }


}
