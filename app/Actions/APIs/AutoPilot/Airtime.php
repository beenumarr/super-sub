<?php

namespace App\Actions\APIs\AutoPilot;

use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\TransactionApi;
use App\Models\AirtimeTransaction;
use Illuminate\Support\Facades\Log;
use App\Actions\Utils\ReverseTransaction;
use App\Utils\Transaction\TransactionHelper;


class Airtime
{

    public function handle(Transaction $transaction, AirtimeTransaction $airtimeTransaction, TransactionApi $api = null)
    {
        $reverseTransaction = new ReverseTransaction();
        $client = new Client();
        $helpers = new TransactionHelper();


        $data = [
            "networkId"=> $airtimeTransaction->network->api_network_id,
            "airtimeType"=> "VTU",
            "phone"=> $airtimeTransaction->phone_number,
            "amount"=> $airtimeTransaction->amount,
            "reference"=> $transaction->reference,
        ];


        $isStandalon = config('app.enable_standalone_api');

        if($isStandalon){
            $networkId = $helpers->getNetworkId($api, $airtimeTransaction->network);
            $apiToken = $api->token;
            $apiUrl = $api->url;
            $data['networkId'] = $networkId;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }

        try {
            $response = $client->post("$apiUrl/v1/airtime", [
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


            if ($res['status'] && $res['code'] === 200) {
                $transaction->update([
                    'status' => 'success',
                    'vending_medium' => $api ? $api->name : 'AutoPilot Api',
                    'api_response' => $res['data']['message'] ?  $res['data']['message'] : 'Transaction Successful',
                ]);
            } else {

                $api_response = $res['data']['message'] ? $res['data']['reference'] . " " . $res['data']['message'] : 'Something Went Wrong!';
                $reverseTransaction->handle($transaction, 'api: '.$api_response);

                // Optionally handle specific response codes
                if ($res['code'] === 424) {
                    // Handle specific case for Failed Dependency
                    Log::warning('Failed Dependency: ' . $res['data']['message']);
                    // Add any specific handling or notifications for the user
                }
            }

        } catch (\Exception $e) {

            $reverseTransaction->handle($transaction);

            $error = $e->getMessage();

            Log::error($error);


        }

        return $transaction->status;
    }


}
