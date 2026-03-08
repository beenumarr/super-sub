<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use App\Models\FundingAccount;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class CreatePaymentPointAccount implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected $request;
    protected $userId;
    /**
     * Create a new job instance.
     */
    public function __construct($request, $userId)
    {
        $this->request = $request;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {

        $PaymentPoint_api_key = config('settings.paymentPoint_api_key');
        $PaymentPoint_secret_key = cs_decrypt(config('settings.paymentPoint_secret_key'));
        $PaymentPoint_business_id = config('settings.paymentPoint_Business_id');



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
                'email' => $this->request['email'],
                'name' => $this->request['name'],
                'phoneNumber' => $this->request['phone'],
                'bankCode' => $bankCode,
                'businessId' => $PaymentPoint_business_id,
            ]);

            $result = $response->json();
            if ($response->successful() && isset($result['status']) && $result['status'] === 'success') {

                if (!empty($result['bankAccounts'])) {
                    foreach ($result['bankAccounts'] as $accountData) {
                        FundingAccount::create([
                            'user_id' => $this->userId,
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

        Log::info('Account creation result', [
            'success' => count($createdAccounts) > 0,
            'created_accounts' => $createdAccounts,
            'failed_banks' => $failedBanks,
        ]);

    }

    private static function generateReference()
    {
        return 'REF-' . strtoupper(uniqid());
    }
        // $response = PaymentPoint::createVirtualAccount($this->request, $this->userId);
        // Log::info('paymentPoint Response:', ['response' => $response]);

}
