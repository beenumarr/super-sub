<?php

namespace App\Actions;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;



class GetApiBalance
{


    public function handle()
    {


        $client = new Client();
        $url = config('settings.transaction_api_url');
        $token = config('settings.transaction_api_token');

        try {
            $response = $client->get("$url/api/user/", [
                'headers' => [
                    'Authorization' => "Token $token",
                    'Content-Type' => 'application/json',
                ],
                'verify' => false,
                'timeout' => 15,
            ]);

            $res = json_decode($response->getBody(), true);

            // Log::info($res);



            if ($res['user']) {

                $user = $res['user'];

               return $user['Account_Balance'];
            }

        } catch (\Exception $e) {

            $error = $e->getMessage();

            Log::error($error );

            return 'N/A';


        }

    }


}
