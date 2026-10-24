<?php

namespace App\Services\PaymentGateway\Zainpay;

use App\Models\FundingAccount;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZainpayService
{
    /**
     * Get the base API URL for Zainpay.
     */
    public static function getBaseUrl(): string
    {
        $url = config('settings.zainpay_api_url');
        if (!empty($url)) {
            return rtrim($url, '/');
        }

        $secret = config('settings.zainpay_secret_key');
        if (!empty($secret) && str_contains(strtolower($secret), 'sandbox')) {
            return 'https://sandbox.zainpay.ng';
        }

        return 'https://api.zainpay.ng';
    }

    /**
     * Resolve the Bearer token for Zainpay API requests.
     */
    public static function getToken(): ?string
    {
        $rawToken = config('settings.zainpay_token');
        if (!empty($rawToken)) {
            return cs_decrypt($rawToken);
        }

        $rawSecret = config('settings.zainpay_secret_key');
        $secretKey = !empty($rawSecret) ? cs_decrypt($rawSecret) : null;

        // If secret key is already a JWT or Bearer token (contains dots like a JWT)
        if (!empty($secretKey) && str_contains($secretKey, '.')) {
            return $secretKey;
        }

        // Try getting token from cache
        $cachedToken = Cache::get('zainpay_auth_token');
        if (!empty($cachedToken)) {
            return $cachedToken;
        }

        // If username and secret are provided, authenticate via /merchant/auth/token/request
        $username = config('settings.zainpay_username');
        if (!empty($username) && !empty($secretKey)) {
            try {
                $baseUrl = self::getBaseUrl();
                $response = Http::timeout(20)->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])->post("{$baseUrl}/merchant/auth/token/request", [
                    'username' => $username,
                    'secret' => $secretKey,
                ]);

                $data = $response->json();
                $token = $data['data']['token'] ?? $data['data'] ?? $data['token'] ?? null;

                if (!empty($token) && is_string($token)) {
                    Cache::put('zainpay_auth_token', $token, now()->addMinutes(50));
                    return $token;
                }
            } catch (\Exception $e) {
                Log::warning('Zainpay auth token request exception: ' . $e->getMessage());
            }
        }

        // Fallback to the secret key itself
        return $secretKey;
    }

    /**
     * Create a virtual account for a user under Zainpay.
     */
    public static function createVirtualAccount(User $user, bool $temporary = false): array
    {
        $token = self::getToken();
        $zainboxCode = config('settings.zainpay_zainbox_code');
        $baseUrl = self::getBaseUrl();

        if (empty($token) || empty($zainboxCode)) {
            Log::warning("Zainpay credentials not fully configured for virtual account creation (user: {$user->id}).");
            return [
                'success' => false,
                'message' => 'Zainpay credentials or Zainbox code not configured.',
            ];
        }

        // Split name into first and last names (minimum 3 characters each as required by Zainpay)
        $cleanName = trim($user->name ?: 'Customer User');
        $nameParts = preg_split('/\s+/', $cleanName);
        $firstName = $nameParts[0] ?? 'User';
        $surname = count($nameParts) > 1 ? end($nameParts) : 'Customer';

        if (strlen($firstName) < 3) {
            $firstName = str_pad($firstName, 3, 'x');
        }
        if (strlen($surname) < 3) {
            $surname = str_pad($surname, 3, 'x');
        }

        // Format mobile number (e.g., 080... or 234...)
        $phone = $user->phone_number ?? $user->phone ?? '08000000000';
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($phone) === 10) {
            $phone = '0' . $phone;
        }

        $bankType = config('settings.zainpay_bank_type', 'wemaBank');
        $dob = '01-01-1995';
        $gender = 'M';
        $address = $user->address ?: 'Nigeria';
        $state = 'Lagos';

        // Prepare payload according to Zainpay documentation
        $payload = [
            'bankType' => $bankType,
            'firstName' => $firstName,
            'surname' => $surname,
            'email' => $user->email,
            'mobileNumber' => $phone,
            'dob' => $dob,
            'gender' => $gender,
            'address' => $address,
            'title' => 'Mr',
            'state' => $state,
            'zainboxCode' => $zainboxCode,
        ];

        // Add decrypted BVN if available
        $bvn = null;
        if (!empty($user->bvn) && !$temporary) {
            $bvn = cs_decrypt($user->bvn);
        } elseif ($temporary && config('settings.temp_account_bvn')) {
            $bvn = cs_decrypt(config('settings.temp_account_bvn'));
        }

        if (!empty($bvn) && strlen($bvn) === 11) {
            $payload['bvn'] = $bvn;
        }

        try {
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => "Bearer {$token}",
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("{$baseUrl}/virtual-account/create/request", $payload);

            $result = $response->json();
            $code = $result['code'] ?? null;
            $status = $result['status'] ?? '';

            if ($response->successful() && ($code === '00' || str_contains($status, '200') || ($result['status'] ?? false) === true)) {
                $accData = $result['data'] ?? [];
                $accountNumber = $accData['accountNumber'] ?? null;
                $returnedBankName = $accData['bankName'] ?? $bankType;
                $accountName = $accData['accountName'] ?? $user->name;

                if (!empty($accountNumber)) {
                    $bankMapping = self::mapBankDetails($returnedBankName);
                    $siteName = config('settings.site_name') ?: 'SuperSub';

                    $fundingAccount = FundingAccount::updateOrCreate(
                        [
                            'user_id' => $user->id,
                            'gateway' => 'Zainpay',
                            'account_type' => $temporary ? 'temporary' : 'permanent',
                        ],
                        [
                            'bank_code' => $bankMapping['code'],
                            'bank_name' => $bankMapping['name'],
                            'account_name' => "{$siteName} - {$accountName}",
                            'account_number' => $accountNumber,
                            'reference' => $accountNumber,
                            'active' => 1,
                        ]
                    );

                    Log::info("Zainpay virtual account created for user {$user->id}: {$accountNumber} ({$bankMapping['name']})");

                    return [
                        'success' => true,
                        'account' => $fundingAccount,
                        'data' => $accData,
                    ];
                }
            }

            $errMsg = $result['description'] ?? $result['message'] ?? 'Failed to generate Zainpay virtual account.';
            Log::error("Zainpay virtual account creation failed for user {$user->id}: {$errMsg}", ['response' => $result]);

            return [
                'success' => false,
                'message' => $errMsg,
            ];

        } catch (\Exception $e) {
            Log::error("Zainpay API Exception for user {$user->id}: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Initialize card/online payment on Zainpay.
     */
    public static function initializePayment(float $amount, string $reference, string $email, string $phone, string $callBackUrl): array
    {
        $token = self::getToken();
        $zainboxCode = config('settings.zainpay_zainbox_code');
        $baseUrl = self::getBaseUrl();

        if (empty($token) || empty($zainboxCode)) {
            return [
                'success' => false,
                'message' => 'Zainpay credentials or Zainbox code not configured.',
            ];
        }

        $phoneFormatted = preg_replace('/[^0-9]/', '', $phone);

        $payload = [
            'amount' => (string) round($amount, 2),
            'txnRef' => $reference,
            'mobileNumber' => $phoneFormatted,
            'zainboxCode' => $zainboxCode,
            'emailAddress' => $email,
            'callBackUrl' => $callBackUrl,
        ];

        try {
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => "Bearer {$token}",
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("{$baseUrl}/zainbox/card/initialize/payment", $payload);

            $result = $response->json();
            $code = $result['code'] ?? null;
            $checkoutUrl = $result['data'] ?? null;

            if ($response->successful() && ($code === '00' || str_contains($result['status'] ?? '', '200')) && !empty($checkoutUrl)) {
                return [
                    'success' => true,
                    'checkout_url' => $checkoutUrl,
                    'reference' => $reference,
                    'data' => $result,
                ];
            }

            $errMsg = $result['description'] ?? $result['message'] ?? 'Unable to initialize Zainpay payment.';
            return [
                'success' => false,
                'message' => $errMsg,
            ];
        } catch (\Exception $e) {
            Log::error('Zainpay payment initialization exception: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify a deposit or transaction on Zainpay.
     */
    public static function verifyTransaction(string $txnRef): array
    {
        $token = self::getToken();
        $baseUrl = self::getBaseUrl();

        try {
            $response = Http::timeout(25)->withHeaders([
                'Authorization' => "Bearer {$token}",
                'Accept' => 'application/json',
            ])->get("{$baseUrl}/virtual-account/wallet/deposit/verify/{$txnRef}");

            if ($response->successful()) {
                return $response->json() ?? [];
            }

            // Fallback to transaction verify endpoint
            $fallback = Http::timeout(25)->withHeaders([
                'Authorization' => "Bearer {$token}",
                'Accept' => 'application/json',
            ])->get("{$baseUrl}/virtual-account/wallet/transaction/verify/{$txnRef}");

            return $fallback->json() ?? [];
        } catch (\Exception $e) {
            Log::error("Zainpay verify transaction error for {$txnRef}: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Map Zainpay bank name to standard CBN bank code and readable title.
     */
    public static function mapBankDetails(string $bankType): array
    {
        $lower = strtolower(str_replace([' ', '-', '_'], '', $bankType));

        if (str_contains($lower, 'wema')) {
            return ['code' => '035', 'name' => 'Wema Bank'];
        }
        if (str_contains($lower, 'gt') || str_contains($lower, 'guaranty')) {
            return ['code' => '058', 'name' => 'GTBank'];
        }
        if (str_contains($lower, 'fidelity')) {
            return ['code' => '070', 'name' => 'Fidelity Bank'];
        }
        if (str_contains($lower, 'fcmb')) {
            return ['code' => '214', 'name' => 'FCMB'];
        }
        if (str_contains($lower, 'sterling')) {
            return ['code' => '232', 'name' => 'Sterling Bank'];
        }
        if (str_contains($lower, 'moniepoint')) {
            return ['code' => '50515', 'name' => 'Moniepoint Microfinance Bank'];
        }
        if (str_contains($lower, '9psb') || str_contains($lower, '9payment')) {
            return ['code' => '120001', 'name' => '9 Payment PSB'];
        }
        if (str_contains($lower, 'providus')) {
            return ['code' => '101', 'name' => 'Providus Bank'];
        }

        return ['code' => '035', 'name' => ucfirst($bankType)];
    }
}
