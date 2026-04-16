<?php

namespace App\Jobs;

use Exception;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Utils\Transaction\TransactionHelper;

class HandleTransactionCompletionWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $eventData;
    public $transactionHelpers;

    public function __construct(array $eventData)
    {
        $this->transactionHelpers = new TransactionHelper();

        $customer = $eventData['customer'] ?? [];
        $accountDetails = $eventData['accountDetails'] ?? [];

        $this->eventData = [
            'transactionReference' => $eventData['transactionReference'] ?? null,
            'amountPaid' => $eventData['amountPaid'] ?? 0,
            'paymentStatus' => $eventData['paymentStatus'] ?? null,
            'paymentMethod' => $eventData['paymentMethod'] ?? null,
            'customerEmail' => $customer['email'] ?? null,
            'customerName' => $customer['name'] ?? 'Nill',
            'accountNumber' => $accountDetails['accountNumber'] ?? null,
            'bankCode' => $accountDetails['bankCode'] ?? null,
        ];
    }

    public function handle(): void
    {
        $data = $this->eventData;

        // Fetch User & Wallet Once
        $user = User::with('wallet')->where('email', $data['customerEmail'])->first();

        if (!$user || !$user->wallet) {
            Log::error("User or Wallet not found for email: {$data['customerEmail']}");
            return;
        }

        $wallet = $user->wallet;

        if ($data['paymentStatus'] !== "PAID") {
            return;
        }

        $description = "{$data['paymentMethod']} {$data['amountPaid']} {$data['transactionReference']}";
        $charges = $this->transactionHelpers->applyMonnifyCharges($data['amountPaid'], config('settings.monnify_funding_charges'));
        $amount = floatval($data['amountPaid']) - $charges;

        $this->performTransaction($user, $wallet, [
            'amount' => $amount,
            'paymentMethod' => $data['paymentMethod'],
            'transactionReference' => $data['transactionReference'],
            'description' => $description,
        ]);
    }

    public function performTransaction($user, $wallet, $data)
    {
        try {
            DB::beginTransaction();

            // Lock wallet for update and modify balance
            $wallet->lockForUpdate()->first();
            $balance_before = $wallet->balance;
            $wallet->increment('balance', $data['amount']);
            $balance_after = $wallet->balance;

            Transaction::create([
                'reference_id' => $this->transactionHelpers->generateTransactionRef('WT'),
                'user_id' => $user->id,
                'type' => 'WALLET',
                'amount' => $data['amount'],
                'status' => 'SUCCESS',
                'provider_name' => 'Monnify',
                'provider_reference' => $data['transactionReference'],
                'api_response' => $data['description'],
                'description' => $data['description'],
                'balance_before' => $balance_before,
                'balance_after' => $balance_after,
                'metadata' => [
                    'ledger_type' => 'credit',
                    'method' => $data['paymentMethod'],
                    'payment_gateway' => 'Monnify',
                ],
            ]);


            DB::commit();

            if ($data['amount'] >= 10000) {
                Log::channel('monnify_transactions')->info(
                    "Payment received for transaction {$data['transactionReference']}.",
                    [
                        'email' => $user->email,
                        'customerName' => $user->name,
                        'amount' => $data['amount'],
                        'paymentMethod' => $data['paymentMethod'],
                    ]
                );
            }

        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage());
        }
    }


}
