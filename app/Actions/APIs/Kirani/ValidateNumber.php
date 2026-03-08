<?php

namespace App\Actions\APIs\Kirani;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class ValidateNumber
{
    /**
     * Fetch customer info and minutes balance for a Kirani number.
     */
    public function handle(string $number): array
    {
        $tokenResult = (new GetToken())->handle();

        if (($tokenResult['status'] ?? null) !== 'success' || empty($tokenResult['token'])) {
            return [
                'status' => 'failed',
                'message' => $tokenResult['message'] ?? 'Unable to obtain token',
            ];
        }

        $idToken = $tokenResult['token'];
        $client = new Client();

        try {
            $customerResponse = $client->get($this->customerUrl($number), [
                'headers' => [
                    'Authorization' => "Bearer {$idToken}",
                    'Content-Type' => 'application/json',
                ],
            ]);

            $customer = json_decode((string) $customerResponse->getBody(), true);

            $minutesResponse = $client->get($this->minutesUrl($number), [
                'headers' => [
                    'Authorization' => "Bearer {$idToken}",
                    'Content-Type' => 'application/json',
                ],
            ]);

            $minutes = json_decode((string) $minutesResponse->getBody(), true);

            return [
                'status' => 'success',
                'name' => $customer['name'] ?? null,
                'minutes' => is_numeric($minutes) ? (int) $minutes : null,
                'raw' => [
                    'customer' => $customer,
                    'minutes' => $minutes,
                ],
            ];
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return [
                'status' => 'failed',
                'message' => 'Validation failed, please try again',
            ];
        }
    }

    protected function customerUrl(string $number): string
    {
        $base = rtrim(config('settings.kirani_customer_url') ?? 'https://backend.kiraniapp.com/api/agent/client/data', '/');
        return "{$base}/{$number}";
    }

    protected function minutesUrl(string $number): string
    {
        $base = rtrim(config('settings.kirani_minutes_url') ?? 'https://backend.kiraniapp.com/api/utils/minutes', '/');
        return "{$base}/{$number}";
    }
}

