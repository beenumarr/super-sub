<?php

namespace App\Services\AfricVerify;

use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ServerException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AfricVerifyService
{
    protected Client $client;
    protected string $apiKey;
    protected string $baseUrl;

    public function __construct(?string $apiKey = null, ?string $baseUrl = null)
    {
        $this->client = new Client([
            'timeout' => 45,
            'connect_timeout' => 15,
        ]);

        $resolvedKey = $apiKey
            ?: config('settings.africverify_api_key')
            ?: config('services.africverify.api_key', '');

        // Support encrypted key if stored via cs_encrypt
        if (str_contains($resolvedKey, '::')) {
            $resolvedKey = cs_decrypt($resolvedKey);
        }

        $this->apiKey = (string) $resolvedKey;

        $resolvedUrl = $baseUrl
            ?: config('settings.africverify_api_url')
            ?: config('services.africverify.base_url', 'https://api.africverify.com/api/v1');

        $this->baseUrl = rtrim((string) $resolvedUrl, '/');
    }

    /**
     * Check if currently running in sandbox environment.
     */
    public function isSandbox(): bool
    {
        return str_starts_with($this->apiKey, 'test_sk_');
    }

    /**
     * Verify an 11-digit Nigerian National Identity Number (NIN).
     *
     * @param string $nin
     * @param string|null $idempotencyKey
     * @return array
     * @throws ValidationException
     */
    public function verifyNin(string $nin, ?string $idempotencyKey = null): array
    {
        $cleanNin = preg_replace('/\D/', '', $nin);

        if (strlen($cleanNin) !== 11) {
            throw ValidationException::withMessages([
                'nin' => 'The National Identity Number must be exactly 11 digits.',
            ]);
        }

        return $this->sendRequest('/kyc/NG/nin', ['nin' => $cleanNin], $idempotencyKey);
    }

    /**
     * Verify an 11-digit Nigerian Bank Verification Number (BVN).
     *
     * @param string $bvn
     * @param string|null $idempotencyKey
     * @return array
     * @throws ValidationException
     */
    public function verifyBvn(string $bvn, ?string $idempotencyKey = null): array
    {
        $cleanBvn = preg_replace('/\D/', '', $bvn);

        if (strlen($cleanBvn) !== 11) {
            throw ValidationException::withMessages([
                'bvn' => 'The Bank Verification Number must be exactly 11 digits.',
            ]);
        }

        return $this->sendRequest('/kyc/NG/bvn', ['bvn' => $cleanBvn], $idempotencyKey);
    }

    /**
     * Send HTTP request to AfricVerify API.
     */
    protected function sendRequest(string $endpoint, array $payload, ?string $idempotencyKey = null): array
    {
        if (empty($this->apiKey)) {
            Log::error('AfricVerify API key is missing or not configured.');
            throw ValidationException::withMessages([
                'service' => 'Verification provider is temporarily unconfigured. Please contact support.',
            ]);
        }

        $key = $idempotencyKey ?: 'av-' . Str::random(24);
        $url = $this->baseUrl . $endpoint;

        try {
            $response = $this->client->post($url, [
                'headers' => [
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                    'Idempotency-Key' => $key,
                ],
                'json' => $payload,
            ]);

            $statusCode = $response->getStatusCode();
            $requestId = $response->getHeaderLine('x-request-id');
            $body = (string) $response->getBody();
            $data = json_decode($body, true);

            Log::channel('general_transactions')->info('AfricVerify Response Received', [
                'endpoint' => $endpoint,
                'status_code' => $statusCode,
                'request_id' => $requestId,
                'is_sandbox' => $this->isSandbox(),
            ]);

            return [
                'success' => true,
                'status_code' => $statusCode,
                'request_id' => $requestId,
                'raw' => $data,
                'data' => $data['data'] ?? [],
                'verification' => $data['data']['verification'] ?? [],
                'account_verified' => (bool) ($data['data']['account_verified'] ?? false),
                'verification_status' => $data['data']['verification_status'] ?? 'unknown',
                'billing_info' => $data['data']['billing_info'] ?? null,
                'identity' => $data['data']['data'] ?? [],
                'message' => $data['data']['message'] ?? ($data['message'] ?? 'Verification completed successfully.'),
            ];

        } catch (ClientException $e) {
            $res = $e->getResponse();
            $statusCode = $res ? $res->getStatusCode() : 400;
            $body = $res ? (string) $res->getBody() : null;
            $requestId = $res ? $res->getHeaderLine('x-request-id') : null;
            $decoded = $body ? json_decode($body, true) : null;

            $errorMessage = $decoded['message']
                ?? ($decoded['data']['message'] ?? $e->getMessage());

            Log::error('AfricVerify ClientException', [
                'endpoint' => $endpoint,
                'status_code' => $statusCode,
                'request_id' => $requestId,
                'error' => $errorMessage,
                'body' => $body,
            ]);

            if ($statusCode === 400) {
                throw ValidationException::withMessages([
                    'identifier' => $errorMessage ?: 'Invalid verification number or format.',
                ]);
            }

            if ($statusCode === 401 || $statusCode === 403) {
                Log::critical('AfricVerify authentication/permission failed. Check API key.');
                throw ValidationException::withMessages([
                    'service' => 'Verification service authorization failed. Please contact administrator.',
                ]);
            }

            if ($statusCode === 402) {
                Log::critical('AfricVerify provider account balance insufficient.');
                throw ValidationException::withMessages([
                    'service' => 'Verification provider service temporarily unavailable. Please try again later.',
                ]);
            }

            if ($statusCode === 409) {
                throw ValidationException::withMessages([
                    'service' => 'A verification request for this number is already processing. Please wait a moment.',
                ]);
            }

            throw ValidationException::withMessages([
                'service' => $errorMessage ?: 'Verification request failed. Please check details and try again.',
            ]);

        } catch (ServerException $e) {
            $res = $e->getResponse();
            $statusCode = $res ? $res->getStatusCode() : 500;
            $requestId = $res ? $res->getHeaderLine('x-request-id') : null;

            Log::error('AfricVerify ServerException (5xx)', [
                'endpoint' => $endpoint,
                'status_code' => $statusCode,
                'request_id' => $requestId,
                'error' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'service' => 'Verification provider network is temporarily unavailable (503). Please retry in a few moments.',
            ]);

        } catch (Exception $e) {
            Log::error('AfricVerify General Exception: ' . $e->getMessage(), [
                'endpoint' => $endpoint,
            ]);

            throw ValidationException::withMessages([
                'service' => 'An unexpected error occurred during verification: ' . $e->getMessage(),
            ]);
        }
    }
}
