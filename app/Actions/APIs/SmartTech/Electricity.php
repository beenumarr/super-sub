<?php

namespace App\Actions\APIs\SmartTech;

use App\Actions\Utils\ReverseTransaction;
use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\ElectricityBillTransaction;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;


class Electricity
{

    public function handle(Transaction $transaction, ElectricityBillTransaction $electricityBillTransaction, TransactionApi $api = null)
    {
        $client = new Client();
        $reverseTransaction = new ReverseTransaction();
        $disco = $electricityBillTransaction->distributor->api_id;

        $data = [
            "electricity_distributor_id"=> (int)$disco,
            "meter_number"=>$electricityBillTransaction->meter_number,
            "amount"=> $transaction->amount,
            "meter_type"=> $electricityBillTransaction->meter_type,
            'name' => $electricityBillTransaction->name,
            "phone_number"=> $electricityBillTransaction->phone_number,
        ];


        Log::info($data);

        $isStandalon = config('app.enable_standalone_api');


        if($isStandalon){
            $apiToken = $api->token;
            $apiUrl = $api->url;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }

        try {
            $response = $client->post("$apiUrl/api/electricity_bill_payments", [
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

                $electricityBillTransaction->update([
                    'token' => $res['token'] ?? ''
                ]);

            }else{

             $reverseTransaction->handle($transaction);

            }

        } catch (\Exception $e) {

            // Handle Errors

            $reverseTransaction->handle($transaction);

            $error = $e->getMessage();

            Log::error($error);

        }

        return $transaction->status;
    }


}
