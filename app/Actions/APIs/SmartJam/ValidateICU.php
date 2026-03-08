<?php

namespace App\Actions\APIs\Default;

use GuzzleHttp\Client;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;



class ValidateICU
{


    public function handle($smart_card_number, $cable_name, TransactionApi $api = null)
    {

        $client = new Client();
        $isStandalon = config('app.enable_standalone_api');


        if($isStandalon){
            $apiToken = $api->token;
            $apiUrl = $api->url;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }


        try {
            $response = $client->get("$apiUrl/ajax/validate_iuc?smart_card_number=$smart_card_number&cablename=$cable_name", [
                'headers' => [
                    'Authorization' => "Token $apiToken",
                    'Content-Type' => 'application/json',
                ]
            ]);

            $res = json_decode($response->getBody(), true);

            Log::info($res);

            if ($res['invalid'] === false) {

               return [
                'status'=> 'success',
                'name'=> $res['name'],
               ];

            }else{

                return [
                    'status' => 'failed',
                    'name'=> 'Validation failed, check the number / cable name'
                ];

            }



        } catch (\Exception $e) {

            $error = $e->getMessage();

            Log::error($error );

            return [
                'status' => 'failed',
                'name'=> 'Validation failed, Try again'

            ];


        }

    }


}
