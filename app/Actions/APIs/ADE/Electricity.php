<?php

namespace App\Actions\APIs\ADE;

use GuzzleHttp\Client;
use App\Models\Transaction;
use Illuminate\Support\Str;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;
use App\Actions\Utils\ReverseTransaction;
use App\Models\ElectricityBillTransaction;



class Electricity
{


    public function handle(Transaction $transaction, ElectricityBillTransaction $electricityBillTransaction, TransactionApi $api = null )
    {

        $client = new Client();
        $reverseTransaction = new ReverseTransaction();
        $disco = $electricityBillTransaction->distributor->api_id;

        $data = [
            "disco_name"=> (int)$disco,
            "meter_number"=>$electricityBillTransaction->meter_number,
            "amount"=> $transaction->amount,
            "MeterType"=> Str::ucfirst($electricityBillTransaction->meter_type),
            "Customer_Phone"=> $electricityBillTransaction->phone_number,
        ];


        $isStandalon = config('app.enable_standalone_api');


        if($isStandalon){
            $apiToken = $api->token;
            $apiUrl = $api->url;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }


        try {
            $response = $client->post("$apiUrl/api/billpayment/", [
                'headers' => [
                    'Authorization' => "Token $apiToken",
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $res = json_decode($response->getBody(), true);

            Log::info($res);


            if ($res['Status'] === 'successful') {

                $transaction->update([
                    'status'=> 'success',
                    'api_response' => $res['ident'] ?? 'Succees'
                ]);


                $electricityBillTransaction->update([
                    'token' => $res['token'] ?? ''
                ]);

            }else{

                $transaction->update([
                    'status'=> 'failed'
                ]);

                //! Make error handling

                $reverseTransaction->handle($transaction);



            }

        } catch (\Exception $e) {
            $transaction->update([
                'status'=> 'failed'
            ]);

            //! Make error handling
            $reverseTransaction->handle($transaction);


            $error = $e->getMessage();

            Log::error($error );

            $pattern = '/response:\s+(.*?)$/i';
            preg_match($pattern, $error, $matches);
            $api_res = $matches[1] ?? [];

            $me = json_decode($api_res, true);

            Log::info($me ?? 'Error' );


            if (isset($me['error'][0])) {
                $errorMessage = $me['error'][0];

                if (strpos($errorMessage, "insufficient balance") !== false) {
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
