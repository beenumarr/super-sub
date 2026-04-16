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

class HandlePaymentpointTransactionWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $eventData;
    public $transactionHelpers;

    public function __construct(array $eventData)
    {
        $this->transactionHelpers = new TransactionHelper();

        $customer = $eventData['customer'] ?? [];
        $accountDetails = $eventData['receiver'] ?? [];

        $this->eventData = [
            'transactionReference' => $eventData['transaction_id'] ?? null,
            'amountPaid' => $eventData['amount_paid'] ?? 0,
            'paymentStatus' => $eventData['transaction_status'] ?? null,
            'paymentMethod' => "BANK TRANSFER",
            'customerEmail' => $customer['email'] ?? null,
            'customerName' => $customer['name'] ?? 'Nill',
            'accountNumber' => $accountDetails['account_number'] ?? null,
            'bankCode' => $accountDetails['bank'] ?? null,
            'settlementAmount' => $accountDetails['settlement_amount'] ?? null,
            // 'description' => $accountDetails['description'] ?? null,
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

        if ($data['paymentStatus'] !== "success") {
            return;
        }




        $description = "{$data['paymentMethod']} {$data['amountPaid']} {$data['transactionReference']}";


        if (config('settings.paymentPoint_funding_charges') === 'settlement_amount') {
            $amount = $data['settlementAmount'];
        } else {
            $charges = $this->transactionHelpers->applyMonnifyCharges($data['amountPaid'], config('settings.paymentPoint_funding_charges'));
            $amount = floatval($data['amountPaid']) - $charges;
        }

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
                'provider_name' => 'PaymentPoint',
                'provider_reference' => $data['transactionReference'],
                'api_response' => $data['description'],
                'description' => $data['description'],
                'balance_before' => $balance_before,
                'balance_after' => $balance_after,
                'metadata' => [
                    'ledger_type' => 'credit',
                    'method' => $data['paymentMethod'],
                    'payment_gateway' => 'PaymentPoint',
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
