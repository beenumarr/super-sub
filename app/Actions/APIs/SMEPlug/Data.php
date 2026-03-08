<?php

namespace App\Actions\APIs\SMEPlug;

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
            "network_id"=> $dataTransaction->network->api_network_id,
            "plan_id"=> $dataTransaction->plan->api_plan_id,
            "phone"=> $dataTransaction->phone_number,
            "customer_reference"=>  $this->generateRef($transaction->reference),
        ];

        $isStandalon = config('app.enable_standalone_api');


        if($isStandalon){
            $networkId = (string) $helpers->getNetworkId($api, $dataTransaction->network);

            $planDetails = $dataTransaction->plan->apis->firstWhere('transaction_api_id', $api->id);
            $data['plan_id'] = $planDetails->product_code;

            $apiToken = $api->token;
            $apiUrl = $api->url;

            $data['network_id'] = $networkId;


        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }

        try {
            $response = $client->post("$apiUrl/v1/data/purchase", [
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

            // {
            //     "status": true,
            //     "data": {
            //         "current_status": "success",
            //         "reference": "b86e5deeb48b181ba547",
            //         "msg": "You have successfully gifted 200MB All Social Daily Plan at N100 to 2348106664640."
            //     }
            // }

            if ($res['status'] && $res['data']['current_status'] === 'success') {
                $transaction->update([
                    'status' => 'success',
                    'vending_medium' => $api ? $api->name : 'SMEPlug Api',
                    'api_response' => $res['data']['msg'] ?  $res['data']['msg'] : 'Transaction Successful',
                ]);
            } else {

                // {
                //     "status": false,
                //     "msg": "Duplicate customer reference"
                // }

                $api_response = $res['msg'] ? $res['msg'] : 'Something Went Wrong!';
                $reverseTransaction->handle($transaction, 'api: '.$api_response);

                // Optionally handle specific response codes
                if ($res['code'] === 424) {
                    // Handle specific case for Failed Dependency
                    Log::warning('Failed Dependency: ' . $res['msg']);
                    // Add any specific handling or notifications for the user
                }
            }
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $res = $e->getResponse();
            $body = $res ? (string) $res->getBody() : null;
            $decoded = $body ? json_decode($body, true) : null;

            $message = $decoded['message'] ?? $e->getMessage();


            $reverseTransaction->handle($transaction, ['api_response'=> $message]);

            Log::error('Response Body: ' . $message);


        }catch (\GuzzleHttp\Exception\ServerException $e) {
            $res = $e->getResponse();
            $body = $res ? (string) $res->getBody() : null;
            $decoded = $body ? json_decode($body, true) : null;

            $message = $decoded['message'] ?? $e->getMessage();
            $statusCode = $res ? $res->getStatusCode() : null;

            // Handle 504 Gateway Timeout specifically
            if ($statusCode == 504) {
                $transaction->update([
                    'status' => 'pending',
                    'api_response' => 'Your transaction is being processed. Thank you for your patience.',
                ]);

                Log::error('504 Gateway Timeout: Transaction set to pending - ' . $message);
            } else {
                $reverseTransaction->handle($transaction, ['api_response'=> $message]);
                Log::error('Server Exception: ' . $message);
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

    public function generateRef($ref) {
        $number = now()->year.$ref;

        return $number;
    }

}
