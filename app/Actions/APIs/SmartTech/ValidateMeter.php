<?php

namespace App\Actions\APIs\SmartTech;

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
            $response = $client->get("$apiUrl/api/validate_meter?meter_number=$meter_number&disco_name=$disco_name&meter_type=$meter_type", [
                'headers' => [
                    'Authorization' => "Bearer $apiToken",
                    'Content-Type' => 'application/json',
                ]
            ]);

            $res = json_decode($response->getBody(), true);

            Log::info($res);

            if ($res['status'] === 'success') {

               return $res;

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
