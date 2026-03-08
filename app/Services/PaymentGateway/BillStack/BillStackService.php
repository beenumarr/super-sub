<?php

namespace App\Services;

use App\Models\FundingAccount;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class BillStackService
{
    public static function createVirtualAccount($request, $userId)
    {
        $nameParts = explode(' ', trim($request['name']));

        // Get first name and last name
        $firstName = $nameParts[0]; // First word
        $lastName = end($nameParts);
        $BillStack_api_key = config('settings.BillStack_api_key');
        $validBanks = ['9PSB', 'PALMPAY', 'PROVIDUS', 'BANKLY', 'SAFEHAVEN'];
        $createdAccounts = []; // Store successful accounts
        $failedBanks = []; // Store failed banks

        foreach ($validBanks as $bank) {
            try {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'Authorization' => "Bearer $BillStack_api_key",
                    'Accept' => 'application/json',
                ])->post('https://api.billstack.co/v2/thirdparty/generateVirtualAccount/', [
                    'reference' => self::generateReference(),
                    'email' => $request['email'],
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                    'phone' => $request['phone'],
                    'bank' => $bank,
                ]);
                $result = $response->json();
             if ($response->successful() && isset($result['status']) && $result['status']) {
                          $accountData = $result['data']['account'][0];

            // Check if the account already exists for the user
            $existingAccount = FundingAccount::where('user_id', $userId)
                ->where('bank_name', $accountData['bank_name'])
                ->where('account_number', $accountData['account_number'])
                ->first();

            if (!$existingAccount) {
                FundingAccount::create([
                    'user_id' => $userId,
                    'funding_bank_id' => null,
                    'bank_code' => $accountData['bank_id'],
                    'bank_name' => $accountData['bank_name'],
                    'account_name' => $accountData['account_name'],
                    'gateway' => 'BillStack',
                    'account_type' => 'permanent',
                    'expire_date' => null,
                    'account_number' => $accountData['account_number'],
                    'active' => 1,
                    'reference' => $result['data']['reference'],
                ]);

                $createdAccounts[] = [
                    'bank' => $accountData['bank_name'],
                    'account_number' => $accountData['account_number'],
                ];
            }
        }
            } catch (\Exception $e) {
                Log::error("BillStack API Error for $bank: " . $e->getMessage());
                $failedBanks[] = [
                    'bank' => $bank,
                    'message' => 'Request failed: ' . $e->getMessage(),
                ];
            }
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
