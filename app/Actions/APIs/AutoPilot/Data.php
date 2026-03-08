<?php

namespace App\Actions\APIs\AutoPilot;

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


        $data = [
            "networkId"=> $dataTransaction->network->api_network_id,
            "dataType"=> "SME",
            "phone"=> $dataTransaction->phone_number,
            "planId"=> $dataTransaction->plan->api_plan_id,
            "reference"=>  $this->generateRef($transaction->reference),
        ];

        $isStandalon = config('app.enable_standalone_api');


        if($isStandalon){
            $networkId = (string) $helpers->getNetworkId($api, $dataTransaction->network);

            $planDetails = $dataTransaction->plan->apis->firstWhere('transaction_api_id', $api->id);
            $data['planId'] = $planDetails->product_code;

            $apiToken = $api->token;
            $apiUrl = $api->url;

            $dataTypeCode = explode("_", $data['planId'])[1];
            $dataTypeMap = [
                'DG' => 'DIRECT GIFTING',
                'CG' => 'CORPORATE GIFTING',
                'SME' => 'SME',
                'AWOOF' => 'AWOOF'
            ];

            $data['dataType'] = $dataTypeMap[$dataTypeCode] ?? null;

            $data['networkId'] = $networkId;


        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }

        try {
            $response = $client->post("$apiUrl/v1/data", [
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

            if ($res['status'] && $res['code'] === 200) {
                $transaction->update([
                    'status' => 'success',
                    'vending_medium' => $api ? $api->name : 'AutoPilot Api',
                    'api_response' => $res['data']['message'] ?  $res['data']['message'] : 'Transaction Successful',
                ]);
            } else {

                $api_response = $res['data']['message'] ? $res['data']['ref'] . " " . $res['data']['message'] : 'Something Went Wrong!';
                $reverseTransaction->handle($transaction, 'api: '.$api_response);

                // Optionally handle specific response codes
                if ($res['code'] === 424) {
                    // Handle specific case for Failed Dependency
                    Log::warning('Failed Dependency: ' . $res['data']['message']);
                    // Add any specific handling or notifications for the user
                }
            }
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            // Handle client exception
            $responseBody = $e->getResponse()->getBody(true);
            $error = json_decode($responseBody, true);


            $api_response = isset($error['code']) && isset($error['data']['message']) ? $error['code'] . " " . $error['data']['message'] : 'Client Exception';


            Log::error('ClientException: ' . $e->getMessage());
            Log::error('Response Body: ' . $responseBody);

            $reverseTransaction->handle($transaction, 'api: '.$api_response);
        } catch (\Exception $e) {
            // Handle general exception
            $error = $e->getMessage();

            // $transaction->update([
            //     'api_response' => 'Exception: ' . $error,
            // ]);

            Log::error('Exception: ' . $error."".$data);

            $reverseTransaction->handle($transaction);
        }


        return $transaction->status;
    }

    public function generateRef($ref) {
        $number = now()->year.$ref;

        return $number;
    }

}
