<?php

namespace App\Actions\APIs\SmartJam;

use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\TransactionApi;
use App\Models\DataTransaction;
use Illuminate\Support\Facades\Log;
use App\Actions\Utils\ReverseTransaction;
use App\Utils\Transaction\TransactionHelper;


class Data
{

    public function handle(Transaction $transaction, DataTransaction $dataTransaction, TransactionApi $api = null)
    {
        $reverseTransaction = new ReverseTransaction();
        $client = new Client();
        $helpers = new TransactionHelper();

        $isStandalon = config('app.enable_standalone_api');

        $data = [
            "network_id"=> $dataTransaction->network->api_network_id,
            "phone"=> $dataTransaction->phone_number,
            "plan_id"=> $dataTransaction->plan->api_plan_id,
        ];

        if($isStandalon){
            $networkId = $helpers->getNetworkId($api, $dataTransaction->network);
            $planId = $dataTransaction->plan->apis->where('transaction_api_id', $api->id)->first()->product_code;
            $apiToken = $api->token;
            $apiUrl = $api->url;
            $data['plan_id'] = $planId;
            $data['network_id'] = $networkId;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }



        try {
            $response = $client->post("$apiUrl/api/v1/data", [
                'headers' => [
                    'Authorization' => "Bearer $apiToken",
                    'Accept' => 'application/json',
                    'X-Requested-With' => 'XMLHttpRequest',
                ],
                'json' => $data,
                'withCredentials' => true,
            ]);

            $res = json_decode($response->getBody(), true);

            Log::info($res);

            if ($res['status'] && $res['final_status'] === 'success') {
                $transaction->update([
                    'status' => 'success',
                    'vending_medium' => $api ? $api->name : 'Default Api',
                    'api_response' => $res['rtr'] ?? 'Transaction Successful',
                ]);
            } else {
                  $reverseTransaction->handle($transaction, $res);
            }
        } catch (\GuzzleHttp\Exception\ClientException $e) {

            $reverseTransaction->handle($transaction);

            // Handle client exception
            $responseBody = $e->getResponse()->getBody(true);
            $error = json_decode($responseBody, true);



            $transaction->update([
                'api_response' =>  isset($error['api_response']) ? $error['api_response'] : 'Something Went Wrong!',
            ]);


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
            Log::error('Response Body: ' . $transaction);

            $statusCode = $e->getResponse()->getStatusCode();    

            if ($statusCode == 429  || $statusCode == 502 ) {
                $reverseTransaction->handle($transaction);
            }

            // Do not reverse the transaction for server errors
        } catch (\Exception $e) {

            // Reverse the transaction only for general exceptions
            $reverseTransaction->handle($transaction);

            // Handle general exception
            $error = $e->getMessage();


            $transaction->update([
                'api_response' => 'Exception: ' . $error,
            ]);

            Log::error('Exception: ' . $error);
        }


        return $transaction->status;
    }


}
