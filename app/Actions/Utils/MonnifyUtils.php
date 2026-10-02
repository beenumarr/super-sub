<?php

namespace App\Actions\Utils;

use GuzzleHttp\Client;




class MonnifyUtils
{



    /**
     * Generate the API token.
     *
     * @return string|null
     */
    public function generateApiToken()
    {
        $client = new Client();
        $apiKey = config('settings.monnify_api_key');
        $isTest = str_starts_with($apiKey ?? '', 'MK_TEST_');
        $url = $isTest ? 'https://sandbox.monnify.com' : (config('settings.monnify_api_url') ?: 'https://api.monnify.com');

        try {
            $response = $client->post("$url/api/v1/auth/login", [
                'headers' => [
                    'Authorization' => 'Basic ' . $this->generateBasicToken(),
                    'Content-Type' => 'application/json',
                ],
                'json' => [],
            ]);

            $data = json_decode($response->getBody(), true);

            return $data['responseBody']['accessToken'];

        } catch (\Exception $e) {
            report($e);

        }
    }

    /**
     * Generate the basic token.
     *
     * @return string
     */
    protected function generateBasicToken()
    {
        $apiKey = config('settings.monnify_api_key');
        $secretKey = config('settings.monnify_secret_key'); // env('MONNIFY_SECRET_KEY');

        $decryptedSecretKey = cs_decrypt($secretKey);

        $key = base64_encode($apiKey . ':' . $decryptedSecretKey);

        return $key;
    }


}
