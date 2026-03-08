<?php

namespace App\Actions\APIs\ADE;

use GuzzleHttp\Client;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;



class ValidateMeter
{


    public function handle($meter_number, $disco_name, $meter_type, TransactionApi $api = null)
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
            $response = $client->get("$apiUrl/ajax/validate_meter_number?meternumber=$meter_number&disconame=$disco_name&mtype=$meter_type", [
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
                'address'=> $res['address'],
               ];

            }else{

                return [
                    'status' => 'failed',
                ];

            }



        } catch (\Exception $e) {

            $error = $e->getMessage();

            Log::error($error );

            return [
                'status' => 'failed',
            ];


        }

    }




}
