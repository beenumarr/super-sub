<?php

namespace App\Actions\APIs\VtPass;

use GuzzleHttp\Client;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;



class ValidateMeter
{


    public function handle($meter_number, $disco_name, $meter_type)
    {

        $client = new Client();
        $api = TransactionApi::find(config('settings.electricicty_bill_transaction_api_id'));


        $data = [
            "serviceID"=> $disco_name,
            "billersCode"=> $meter_number,
            "type"=> $meter_type,
        ];


        try {
            $response = $client->post("$api->url/merchant-verify", [
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode("$api->username:$api->password"),
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $res = json_decode($response->getBody(), true);


            Log::info($res);



            if ($res['code'] === "000" && $res['content']['Customer_Name']) {

               return [
                'status'=> 'success',
                'name'=> $res['content']['Customer_Name'],
                'address'=> $res['content']['Address'],
               ];
            }

            return [
                'status'=> 'failed',
            ];

        } catch (\Exception $e) {

            $error = $e->getMessage();

            Log::error($error );

            return [
                'status'=> 'failed',
            ];


        }

    }


}
