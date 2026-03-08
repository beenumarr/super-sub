<?php

namespace App\Actions\APIs\Ogdams;

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
            "networkId"=> $dataTransaction->network->api_network_id, //! api id from api
            "phoneNumber"=> $dataTransaction->phone_number,
            "planId"=> $dataTransaction->plan->api_plan_id,
        ];




        if(config('app.enable_standalone_api')){
            $networkId = $helpers->getNetworkId($api, $dataTransaction->network);
            $apiToken = $api->token;
            $data['planId'] = $dataTransaction->plan->apis->where('transaction_api_id', $api->id)->first()->product_code;
            $data['networkId'] = $networkId;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }

        try {
            $response = $client->post("https://simhosting.ogdams.ng/api/v1/vend/data", [
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
                    'vending_medium' => $api ? $api->name : 'OGdams Api',
                    'api_response' => $res['data']['msg'] ?  $res['data']['msg'] : 'Transaction Successful',
                ]);
            } else {

                $api_response = $res['data']['msg'] ? $res['data']['ref'] . " " . $res['data']['msg'] : 'Something Went Wrong!';
                $reverseTransaction->handle($transaction, 'api: '.$api_response);

                // $transaction->update([
                //     'vending_medium' => $api ? $api->name : 'OGdams Api',
                //     'api_response' => $res['data']['msg'] ? $res['data']['ref'] . " " . $res['data']['msg'] : 'Transaction is Processing',
                //     'api_reference' => $res['data']['ref'],
                // ]);

                // Optionally handle specific response codes
                if ($res['code'] === 424) {
                    // Handle specific case for Failed Dependency
                    Log::warning('Failed Dependency: ' . $res['data']['msg']);
                    // Add any specific handling or notifications for the user
                }
            }
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            // Handle client exception
            $responseBody = $e->getResponse()->getBody(true);
            $error = json_decode($responseBody, true);


            $api_response = isset($error['code']) && isset($error['data']['msg']) ? $error['code'] . " " . $error['data']['msg'] : 'Client Exception';


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


}
