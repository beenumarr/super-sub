<?php

namespace App\Actions\APIs\Kirani;

use App\Models\AppConfiguration;
use GuzzleHttp\Client;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;



class GetToken
{


    public function handle(): array
    {
        $idToken = $this->getConfigValue('kirani_id_token', decrypt: true);
        $refreshToken = $this->getConfigValue('kirani_refresh_token', decrypt: true);
        $expiry = $this->getConfigValue('kirani_token_expiry');
        $expiresAt = $this->parseExpiry($expiry);

        if ($idToken && $expiresAt && $expiresAt->isFuture()) {
            return [
                'status' => 'success',
                'token' => $idToken,
                'message' => 'Token is still valid.',
            ];
        }

        if ($refreshToken) {
            $refreshed = $this->refreshToken($refreshToken);
            if ($refreshed['status'] === 'success') {
                return $refreshed;
            }
        }

        return $this->getToken();
    }

    protected function getToken(): array
    {
        $client = new Client();

        $username = $this->getConfigValue('kirani_username', decrypt: true);
        $password = $this->getConfigValue('kirani_password', decrypt: true);
        $apiUrl = $this->getConfigValue('kirani_login_url');

        try {
            $response = $client->post($apiUrl, [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'returnSecureToken' => true,
                    'email' => $username,
                    'password' => $password,
                    'clientType' => 'CLIENT_TYPE_WEB',
                ],
            ]);

            $res = json_decode((string) $response->getBody(), true);
            $statusCode = $response->getStatusCode();

            if (
                $statusCode === 200 &&
                !empty($res['idToken']) &&
                !empty($res['refreshToken']) &&
                !empty($res['expiresIn'])
            ) {
                $this->storeTokens($res['idToken'], $res['refreshToken'], $res['expiresIn']);

                return [
                    'status' => 'success',
                    'token' => $res['idToken'],
                    'message' => 'Token generated successfully.',
                ];
            }

            return [
                'status' => 'failed',
                'message' => 'Failed to obtain token.',
            ];
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return [
                'status' => 'failed',
                'message' => $e->getMessage(),
            ];
        }
    }

    protected function refreshToken(string $refreshToken): array
    {
        $client = new Client();
        $apiUrl = $this->getConfigValue('kirani_refresh_url');

        try {
            $response = $client->post($apiUrl, [
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'grant_type' => 'refresh_token',
                    'refresh_token' => $refreshToken,
                ],
            ]);

            $res = json_decode((string) $response->getBody(), true);
            $expiresIn = $res['expires_in'] ?? $res['expiresIn'] ?? null;
            $idToken = $res['id_token'] ?? $res['idToken'] ?? null;
            $newRefresh = $res['refresh_token'] ?? $res['refreshToken'] ?? null;

            if ($idToken && $newRefresh && $expiresIn) {
                $this->storeTokens($idToken, $newRefresh, $expiresIn);

                return [
                    'status' => 'success',
                    'token' => $idToken,
                    'message' => 'Token refreshed successfully.',
                ];
            }

            return [
                'status' => 'failed',
                'message' => 'Failed to refresh token.',
            ];
        } catch (\Exception $e) {
            Log::error($e->getMessage());

            return [
                'status' => 'failed',
                'message' => $e->getMessage(),
            ];
        }
    }

    protected function storeTokens(string $idToken, string $refreshToken, int|string $expiresIn): void
    {
        $expiresAt = Carbon::now()->addSeconds((int) $expiresIn);

        AppConfiguration::updateOrCreate(
            ['key' => 'kirani_id_token'],
            ['value' => cs_encrypt($idToken)]
        );

        AppConfiguration::updateOrCreate(
            ['key' => 'kirani_refresh_token'],
            ['value' => cs_encrypt($refreshToken)]
        );

        AppConfiguration::updateOrCreate(
            ['key' => 'kirani_token_expiry'],
            ['value' => $expiresAt]
        );

        // Keep the runtime config up-to-date for the current request.
        config([
            'settings.kirani_id_token' => cs_encrypt($idToken),
            'settings.kirani_refresh_token' => cs_encrypt($refreshToken),
            'settings.kirani_token_expiry' => $expiresAt,
        ]);
    }

    protected function getConfigValue(string $key, bool $decrypt = false): ?string
    {
        $record = AppConfiguration::where('key', $key)->first();
        $value = $record?->value;

        if ($decrypt && $value) {
            return cs_decrypt($value);
        }

        return $value;
    }





    protected function parseExpiry(?string $expiry): ?Carbon
    {
        if (empty($expiry)) {
            return null;
        }

        $normalized = strtolower(trim((string) $expiry));
        if ($normalized === 'null') {
            return null;
        }

        try {
            return Carbon::parse($expiry);
        } catch (\Exception $e) {
            Log::warning('Invalid kirani_token_expiry value: ' . $expiry);
            return null;
        }
    }
}
