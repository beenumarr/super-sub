<?php
namespace App\Services\Paymentpoint;

use App\Models\FundingAccount;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class PaymentPoint
{
    public static function createVirtualAccount($request, $userId)
    {
        $PaymentPoint_api_key = config('settings.paymentPoint_api_key');
        $PaymentPoint_secret_key = config('settings.paymentPoint_secret_key');
        $PaymentPoint_business_id = config('settings.paymentPoint_Bussiness_id');
        $bankCode = ['20946'];
        $createdAccounts = [];
        $failedBanks = [];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => "Bearer $PaymentPoint_secret_key",
                'api-key' => "$PaymentPoint_api_key",
                'Accept' => 'application/json',
            ])->post('https://api.paymentpoint.co/api/v1/createVirtualAccount', [
                'reference' => self::generateReference(),
                'email' => $request['email'],
                'name' => $request['name'],
                'phoneNumber' => $request['phone'],
                'bank' => $bankCode,
                'businessId' => $PaymentPoint_business_id,
            ]);

            $result = $response->json();

            if ($response->successful() && isset($result['status']) && $result['status'] === 'success') {
                if (!empty($result['bankAccounts'])) {
                    foreach ($result['bankAccounts'] as $accountData) {
                        FundingAccount::create([
                            'user_id' => $userId,
                            'funding_bank_id' => null,
                            'bank_code' => $accountData['bankCode'],
                            'bank_name' => $accountData['bankName'],
                            'account_name' => $accountData['accountName'],
                            'gateway' => 'PaymentPoint',
                            'account_type' => 'permanent',
                            'expire_date' => null,
                            'account_number' => $accountData['accountNumber'],
                            'active' => 1,
                            'reference' => $result['customer']['customer_id'] ?? null,
                        ]);

                        $createdAccounts[] = [
                            'bank' => $accountData['bankName'],
                            'account_number' => $accountData['accountNumber'],
                        ];
                    }
                } else {
                    $failedBanks[] = [
                        'bank' => implode(',', $bankCode),
                        'message' => 'No bank accounts were created.',
                    ];
                }
            } else {
                $failedBanks[] = [
                    'bank' => implode(',', $bankCode),
                    'message' => $result['message'] ?? 'API response failed.',
                ];
            }

            if (!empty($result['errors'])) {
                foreach ($result['errors'] as $error) {
                    Log::error("PaymentPoint API Error: $error");
                    $failedBanks[] = ['bank' => implode(',', $bankCode), 'message' => $error];
                }
            }
        } catch (\Exception $e) {
            Log::error("PaymentPoint API Request Failed: " . $e->getMessage());
            $failedBanks[] = [
                'bank' => implode(',', $bankCode),
                'message' => 'Request failed: ' . $e->getMessage(),
            ];
        }

        return [
            'success' => count($createdAccounts) > 0,
            'created_accounts' => $createdAccounts,
            'failed_banks' => $failedBanks,
        ];
    }

    private static function generateReference()
    {
        return 'REF-' . strtoupper(uniqid());
    }
}
