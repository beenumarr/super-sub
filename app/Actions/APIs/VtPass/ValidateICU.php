<?php

namespace App\Actions\APIs\VtPass;

use GuzzleHttp\Client;
use Illuminate\Support\Str;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;



class ValidateICU
{


    public function handle($smart_card_number, $cable_name, TransactionApi $api = null)
    {

        $client = new Client();

        $cable = $cable_name === 'STARTIME'? 'startimes' : $cable_name;


        $data = [
            "serviceID"=> Str::lower($cable),
            "billersCode"=> $smart_card_number,
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
               ];
            }

            return [
                'status'=> 'failed',
                'name'=> 'Validation failed, check the number / cable name'

            ];

        } catch (\Exception $e) {

            $error = $e->getMessage();

            Log::error($error );

            return [
                'status'=> 'failed',
                'name'=> 'Validation failed, check the number / cable name'

            ];


        }

    }


}
