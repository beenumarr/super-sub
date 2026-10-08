<?php

namespace App\Actions\APIs\Accelerate;

use GuzzleHttp\Client;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AccelerateClient
{
    protected ?TransactionApi $api;
    protected Client $httpClient;

    const LIVE_AUTH_URL = 'https://prod.user-mgt.irechargetech.com/api/v1/auth/api-client/token';
    const TEST_AUTH_URL = 'https://test.user-mgt.irechargetech.com/api/v1/auth/api-client/token';

    const LIVE_TV_URL = 'https://prod.airtime-data.irechargetech.com/api/v2';
    const TEST_TV_URL = 'https://test.airtime-data.irechargetech.com/api/v2';

    const LIVE_POWER_URL = 'https://prod.power.irechargetech.com';
    const TEST_POWER_URL = 'https://test.power.irechargetech.com';

    public function __construct(?TransactionApi $api = null)
    {
        $this->api = $api ?: $this->resolveDefaultApi();
        $this->httpClient = new Client([
            'timeout' => 45,
            'connect_timeout' => 15,
            'http_errors' => false,
        ]);
    }

    protected function resolveDefaultApi(): ?TransactionApi
    {
        return TransactionApi::where('model', 'like', '%Accelerate%')->first();
    }

    public function isTestMode(): bool
    {
        if (config('app.test_mode')) {
            return true;
        }

        if ($this->api && $this->api->url) {
            $urlLower = strtolower($this->api->url);
            return str_contains($urlLower, 'test') || str_contains($urlLower, 'sandbox') || str_contains($urlLower, 'dev');
        }

        return false;
    }

    public function getAuthUrl(): string
    {
        return $this->isTestMode() ? self::TEST_AUTH_URL : self::LIVE_AUTH_URL;
    }

    public function getTvBaseUrl(): string
    {
        return $this->isTestMode() ? self::TEST_TV_URL : self::LIVE_TV_URL;
    }

    public function getPowerBaseUrl(): string
    {
        return $this->isTestMode() ? self::TEST_POWER_URL : self::LIVE_POWER_URL;
    }

    public function getPublicKey(): ?string
    {
        return $this->api?->public_key ?: $this->api?->username;
    }

    public function getPrivateKey(): ?string
    {
        return $this->api?->secret_key ?: $this->api?->password;
    }

    public function getAccessToken(): ?string
    {
        if ($this->api && !empty($this->api->token) && !str_contains($this->api->token, '*')) {
            // If admin directly configured a persistent token or bearer token
            return $this->api->token;
        }

        $publicKey = $this->getPublicKey();
        $privateKey = $this->getPrivateKey();

        if (empty($publicKey) || empty($privateKey)) {
            Log::error('Accelerate API credentials missing: public or private key is empty.');
            return null;
        }

        $cacheKey = 'accelerate_jwt_token_' . ($this->api ? $this->api->id : 'default');

        return Cache::remember($cacheKey, now()->addMinutes(45), function () use ($publicKey, $privateKey) {
            $authUrl = $this->getAuthUrl();
            $basicAuth = base64_encode("{$publicKey}:{$privateKey}");

            try {
                // Try GET first as per Accelerate documentation
                $response = $this->httpClient->get($authUrl, [
                    'headers' => [
                        'Authorization' => 'Basic ' . $basicAuth,
                        'Accept' => 'application/json',
                        'Content-Type' => 'application/json',
                    ],
                ]);

                $body = (string) $response->getBody();
                $res = json_decode($body, true);

                // If GET failed or not supported, try POST
                if ($response->getStatusCode() >= 400 || empty($res)) {
                    $response = $this->httpClient->post($authUrl, [
                        'headers' => [
                            'Authorization' => 'Basic ' . $basicAuth,
                            'Accept' => 'application/json',
                            'Content-Type' => 'application/json',
                        ],
                    ]);
                    $body = (string) $response->getBody();
                    $res = json_decode($body, true);
                }

                if (!empty($res)) {
                    $token = $res['access_token'] ?? $res['token'] ?? $res['data']['token'] ?? $res['data']['access_token'] ?? null;
                    if ($token) {
                        return $token;
                    }
                }

                Log::error('Accelerate Auth Token extraction failed', [
                    'status' => $response->getStatusCode(),
                    'body' => $body,
                ]);
            } catch (\Exception $e) {
                Log::error('Accelerate Auth Exception: ' . $e->getMessage());
            }

            return null;
        });
    }

    public function getAuthHeaders(): array
    {
        $token = $this->getAccessToken();
        return [
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];
    }

    // ==========================================
    // TV (Cable) Methods
    // ==========================================

    public function mapCableProvider(string $cableName): string
    {
        $normalized = strtoupper(trim($cableName));
        return match ($normalized) {
            'STARTIME', 'STARTIMES' => 'STARTIMES',
            'GOTV' => 'GOTV',
            'DSTV' => 'DSTV',
            default => $normalized,
        };
    }

    public function getTvProviders(): array
    {
        $url = $this->getTvBaseUrl() . '/supermerchant-tv/providers';
        $response = $this->httpClient->get($url, [
            'headers' => $this->getAuthHeaders(),
        ]);

        return json_decode((string) $response->getBody(), true) ?? [];
    }

    public function getTvPackages(string $provider, int $page = 1, int $limit = 50): array
    {
        $providerName = $this->mapCableProvider($provider);
        $url = $this->getTvBaseUrl() . "/supermerchant-tv/packages?provider_name={$providerName}&page={$page}&limit={$limit}";

        $response = $this->httpClient->get($url, [
            'headers' => $this->getAuthHeaders(),
        ]);

        return json_decode((string) $response->getBody(), true) ?? [];
    }

    public function validateTv(string $provider, string $smartCardNumber, ?string $package = null, ?string $phone = null, ?string $email = null): array
    {
        $url = $this->getTvBaseUrl() . '/supermerchant-tv/validate';
        $providerName = $this->mapCableProvider($provider);

        $payload = [
            'provider' => $providerName,
            'receiver' => (string) $smartCardNumber,
            'package' => (string) ($package ?: 'default'),
            'phone_number' => (string) ($phone ?: '08000000000'),
        ];

        if (!empty($email)) {
            $payload['email'] = $email;
        }

        try {
            $response = $this->httpClient->post($url, [
                'headers' => $this->getAuthHeaders(),
                'json' => $payload,
            ]);

            $body = (string) $response->getBody();
            $res = json_decode($body, true);

            Log::info('Accelerate TV validate response', ['status' => $response->getStatusCode(), 'res' => $res]);

            return [
                'http_code' => $response->getStatusCode(),
                'data' => $res,
            ];
        } catch (\Exception $e) {
            Log::error('Accelerate TV validate exception: ' . $e->getMessage());
            return [
                'http_code' => 500,
                'data' => ['message' => $e->getMessage()],
            ];
        }
    }

    public function vendTv(string $validationReference, string $transactionReference): array
    {
        $url = $this->getTvBaseUrl() . '/supermerchant-tv/vend';
        $payload = [
            'validation_reference' => $validationReference,
            'transaction_reference' => $transactionReference,
        ];

        try {
            $response = $this->httpClient->post($url, [
                'headers' => $this->getAuthHeaders(),
                'json' => $payload,
            ]);

            $body = (string) $response->getBody();
            $res = json_decode($body, true);

            Log::info('Accelerate TV vend response', ['status' => $response->getStatusCode(), 'res' => $res]);

            return [
                'http_code' => $response->getStatusCode(),
                'data' => $res,
            ];
        } catch (\Exception $e) {
            Log::error('Accelerate TV vend exception: ' . $e->getMessage());
            return [
                'http_code' => 500,
                'data' => ['message' => $e->getMessage()],
            ];
        }
    }

    public function requeryTv(string $transactionReference): array
    {
        $url = $this->getTvBaseUrl() . '/super-merchants/requery?t_ref=' . urlencode($transactionReference);

        try {
            $response = $this->httpClient->get($url, [
                'headers' => $this->getAuthHeaders(),
            ]);

            return [
                'http_code' => $response->getStatusCode(),
                'data' => json_decode((string) $response->getBody(), true),
            ];
        } catch (\Exception $e) {
            return [
                'http_code' => 500,
                'data' => ['message' => $e->getMessage()],
            ];
        }
    }

    // ==========================================
    // Power (Electricity) Methods
    // ==========================================

    public function mapDiscoProvider(string $disco): string
    {
        $clean = strtolower(trim($disco));
        $map = [
            'ikeja-electric' => 'IKEDC',
            'ikeja electric' => 'IKEDC',
            'ikedc' => 'IKEDC',

            'eko-electric' => 'EKEDC',
            'eko electric' => 'EKEDC',
            'ekedc' => 'EKEDC',

            'abuja-electric' => 'AEDC',
            'abuja electric' => 'AEDC',
            'aedc' => 'AEDC',

            'kano-electric' => 'KEDCO',
            'kano electric' => 'KEDCO',
            'kedco' => 'KEDCO',

            'enugu-electric' => 'EEDC',
            'enugu electric' => 'EEDC',
            'eedc' => 'EEDC',

            'port-harcourt-electric' => 'PHED',
            'port harcourt electric' => 'PHED',
            'phed' => 'PHED',

            'ibadan-electric' => 'IBEDC',
            'ibadan electric' => 'IBEDC',
            'ibedc' => 'IBEDC',

            'kaduna-electric' => 'KAEDCO',
            'kaduna electric' => 'KAEDCO',
            'kaedco' => 'KAEDCO',
            'kedc' => 'KAEDCO',

            'jos-electric' => 'JED',
            'jos electric' => 'JED',
            'jed' => 'JED',

            'benin-electric' => 'BEDC',
            'benin electric' => 'BEDC',
            'bedc' => 'BEDC',

            'yola-electric' => 'YEDC',
            'yola electric' => 'YEDC',
            'yedc' => 'YEDC',

            'aba-electric' => 'APLE',
            'aba electric' => 'APLE',
            'aple' => 'APLE',
        ];

        return $map[$clean] ?? strtoupper($disco);
    }

    public function getPowerProviders(): array
    {
        $url = $this->getPowerBaseUrl() . '/api/v2/supermerchant-power/providers';
        $response = $this->httpClient->get($url, [
            'headers' => $this->getAuthHeaders(),
        ]);

        return json_decode((string) $response->getBody(), true) ?? [];
    }

    public function validatePower(string $disco, string $meterNumber, string $meterType, float $amount = 1000): array
    {
        $url = $this->getPowerBaseUrl() . '/api/v2/supermerchant-power/validate';
        $providerCode = $this->mapDiscoProvider($disco);
        $normalizedType = strtoupper(trim($meterType)) === 'POSTPAID' ? 'POSTPAID' : 'PREPAID';

        $payload = [
            'meter_type' => $normalizedType,
            'provider' => $providerCode,
            'receiver' => (string) $meterNumber,
            'amount' => (float) ($amount > 0 ? $amount : 1000),
        ];

        try {
            $response = $this->httpClient->post($url, [
                'headers' => $this->getAuthHeaders(),
                'json' => $payload,
            ]);

            $body = (string) $response->getBody();
            $res = json_decode($body, true);

            Log::info('Accelerate Power validate response', ['status' => $response->getStatusCode(), 'res' => $res]);

            return [
                'http_code' => $response->getStatusCode(),
                'data' => $res,
            ];
        } catch (\Exception $e) {
            Log::error('Accelerate Power validate exception: ' . $e->getMessage());
            return [
                'http_code' => 500,
                'data' => ['message' => $e->getMessage()],
            ];
        }
    }

    public function vendPower(string $validationReference, string $transactionReference): array
    {
        $url = $this->getPowerBaseUrl() . '/api/v2/supermerchant-power/vend';
        $payload = [
            'validation_reference' => $validationReference,
            'transaction_reference' => $transactionReference,
        ];

        try {
            $response = $this->httpClient->post($url, [
                'headers' => $this->getAuthHeaders(),
                'json' => $payload,
            ]);

            $body = (string) $response->getBody();
            $res = json_decode($body, true);

            Log::info('Accelerate Power vend response', ['status' => $response->getStatusCode(), 'res' => $res]);

            return [
                'http_code' => $response->getStatusCode(),
                'data' => $res,
            ];
        } catch (\Exception $e) {
            Log::error('Accelerate Power vend exception: ' . $e->getMessage());
            return [
                'http_code' => 500,
                'data' => ['message' => $e->getMessage()],
            ];
        }
    }

    public function requeryPower(string $transactionReference): array
    {
        $url = $this->getPowerBaseUrl() . '/api/v2/merchant/requery?transaction_reference=' . urlencode($transactionReference);

        try {
            $response = $this->httpClient->get($url, [
                'headers' => $this->getAuthHeaders(),
            ]);

            return [
                'http_code' => $response->getStatusCode(),
                'data' => json_decode((string) $response->getBody(), true),
            ];
        } catch (\Exception $e) {
            return [
                'http_code' => 500,
                'data' => ['message' => $e->getMessage()],
            ];
        }
    }
}
