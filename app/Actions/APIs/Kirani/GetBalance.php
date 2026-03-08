<?php

namespace App\Actions\APIs\Kirani;

use App\Models\AppConfiguration;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;



class GetBalance
{


    public function handle(): array
    {
        $tokenResult = (new GetToken())->handle();

        if (($tokenResult['status'] ?? null) !== 'success' || empty($tokenResult['token'])) {
            return [
                'status' => 'failed',
                'message' => $tokenResult['message'] ?? 'Unable to obtain token',
            ];
        }

        $apiToken = $tokenResult['token'];
        $apiUrl = $this->getBalanceUrl();

        $client = new Client();

        try {
            $response = $client->get($apiUrl, [
                'headers' => [
                    'Authorization' => "Bearer {$apiToken}",
                    'Content-Type' => 'application/json',
                ]
            ]);

            $res = json_decode((string) $response->getBody(), true);

            $statusCode = $response->getStatusCode();

            if ($statusCode === 200 && isset($res['credit'])) {
                AppConfiguration::updateOrCreate(['key' => 'kirani_credit_balance'], ['value' => $res['credit']]);

                return [
                    'status' => 'success',
                    'message' => 'Balance updated successfully',
                    'balance' => $res['credit'],
                ];
            }

            return [
                'status' => 'failed',
                'message' => $res['message'] ?? 'Failed to update balance',
            ];

        } catch (\Exception $e) {

            $error = $e->getMessage();

            Log::error($error );

            return [
                'status' => 'failed',
                'message' => $error,
            ];

        }

    }

    protected function getBalanceUrl(): string
    {
        $configured = AppConfiguration::where('key', 'kirani_balance_url')->value('value');

        return $configured ?: 'https://backend.kiraniapp.com/api/agent/credit';
    }
}
