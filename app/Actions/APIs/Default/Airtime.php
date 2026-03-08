<?php

namespace App\Actions\APIs\Default;

use App\Actions\Utils\ReverseTransaction;
use App\Models\AirtimeTransaction;
use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\TransactionApi;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Support\Facades\Log;


class Airtime
{

    public function handle(Transaction $transaction, AirtimeTransaction $airtimeTransaction, TransactionApi $api = null)
    {
        $reverseTransaction = new ReverseTransaction();
        $client = new Client([
            'timeout' => 180, // Increase to 30, 60, or even 90 seconds (adjust based on typical API response times)
            'connect_timeout' => 10, // Timeout for connecting to the server
        ]);
        $helpers = new TransactionHelper();

        $data = [
            "network"=> $airtimeTransaction->network->api_network_id,
            "mobile_number"=> $airtimeTransaction->phone_number,
            "amount"=> (int) $airtimeTransaction->amount,
            "Ported_number"=> true,
            "airtime_type"=>"VTU"
        ];

        if(config('app.enable_standalone_api')){
            $networkId = $helpers->getNetworkId($api, $airtimeTransaction->network);
            $apiToken = $api->token;
            $apiUrl = $api->url;
            $data['network'] = $networkId;

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

            if ($res['Status'] === 'successful') {

                $transaction->update([
                    'status'=> 'success',
                    'vending_medium'=> $api? $api->name : 'Default Api',
                    'api_response' => $res['api_response']?? 'Transaction Successfull'
                ]);

            }else{

                $transaction->update([
                    'vending_medium'=> $api? $api->name : 'Default Api',
                    'api_response' => $res['api_response']?? 'Transaction Processing'
                ]);

            }

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            // Handle client exception
            $reverseTransaction->handle($transaction);

            $responseBody = $e->getResponse()->getBody(true);
            $error = json_decode($responseBody, true);

            Log::error('ClientException: ' . $e->getMessage());
            Log::error('Response Body: ' . $responseBody);

        } catch (\GuzzleHttp\Exception\ServerException $e) {
            // Handle server exception (500 errors)
            $responseBody = $e->getResponse()->getBody(true);
            $error = json_decode($responseBody, true);

            $transaction->update([
                'api_response' =>  isset($error['api_response']) ? $error['api_response'] : 'Server Exception',
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
