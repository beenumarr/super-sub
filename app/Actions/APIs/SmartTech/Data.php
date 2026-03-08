<?php

namespace App\Actions\APIs\SmartTech;

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

        $isStandalon = config('app.enable_standalone_api');

        $data = [
            "network"=> $dataTransaction->network->api_network_id,
            "mobile_number"=> $dataTransaction->phone_number,
            "plan"=> $dataTransaction->plan->api_plan_id,
            "Ported_number"=> true,
        ];

        if($isStandalon){
            $planId = $dataTransaction->plan->apis->where('transaction_api_id', $api->id)->first()->product_code;
            $apiToken = $api->token;
            $apiUrl = $api->url;
            $data['plan'] = $planId;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }

        try {
            $response = $client->post("$apiUrl/api/data/1", [
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

                // $transaction->update([
                //     // 'status'=> 'success',
                //     'vending_medium'=> $api? $api->name : 'Default Api',
                //     'api_response' => $res['api_response']?? 'Transaction Successfull'
                // ]);

             $reverseTransaction->handle($transaction, $res);

            }

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            // Handle client exception
            $responseBody = $e->getResponse()->getBody(true);
            $error = json_decode($responseBody, true);

            $transaction->update([
                'api_response' =>  isset($error['api_response']) ?  $error['api_response'] : 'Client Exception',
            ]);

            Log::error('ClientException: ' . $e->getMessage());
            Log::error('Response Body: ' . $responseBody);

            $reverseTransaction->handle($transaction);
        } catch (\GuzzleHttp\Exception\ServerException $e) {
            // Handle server exception (500 errors)
            $responseBody = $e->getResponse()->getBody(true);
            $error = json_decode($responseBody, true);

            $transaction->update([
                'api_response' =>  isset($error['api_response']) ?  $error['api_response'] : 'Server Exception',
            ]);

            Log::error('ServerException: ' . $e->getMessage());
            Log::error('Response Body: ' . $responseBody);

            // Do not reverse the transaction for server errors
        } catch (\Exception $e) {
            // Handle general exception
            $error = $e->getMessage();

            $transaction->update([
                'api_response' => 'Exception: ' . $error,
            ]);

            Log::error('Exception: ' . $error);

            // Reverse the transaction only for general exceptions
            $reverseTransaction->handle($transaction);
        }


        return $transaction->status;
    }


}
