<?php

namespace App\Jobs;

use App\Models\FundingAccount;
use App\Models\Transaction;
use App\Models\User;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HandleZainpayWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $payload;

    /**
     * Create a new job instance.
     *
     * @param array $payload
     */
    public function __construct(array $payload)
    {
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $helpers = new TransactionHelper();
        $payload = $this->payload;
        $data = $payload['data'] ?? $payload;

        $event = $payload['event'] ?? ($data['txnType'] ?? 'deposit');

        // Extract key payment details
        $rawAmount = $data['depositedAmount'] ?? $data['amount'] ?? 0;
        $amount = floatval($rawAmount);
        $settlementAmount = isset($data['amountAfterCharges']) ? floatval($data['amountAfterCharges']) : null;
        $reference = $data['paymentRef'] ?? $data['txnRef'] ?? null;
        $accountNumber = $data['beneficiaryAccountNumber'] ?? $data['accountNumber'] ?? null;
        $customerEmail = $data['emailNotification'] ?? $data['email'] ?? $data['customerEmail'] ?? null;
        $narration = $data['narration'] ?? "Zainpay payment {$reference}";

        if ($amount <= 0 || empty($reference)) {
            Log::warning('Zainpay webhook skipped: Invalid amount or reference.', ['data' => $data]);
            return;
        }

        // Check if transaction has already been credited (idempotency check)
        if (Transaction::where('provider_reference', $reference)->exists()) {
            Log::info("Zainpay webhook: Transaction with reference {$reference} already processed.");
            return;
        }

        // Find user by virtual account number first, then fallback to email
        $user = null;
        if (!empty($accountNumber)) {
            $fundingAccount = FundingAccount::where('account_number', $accountNumber)->first();
            if ($fundingAccount) {
                $user = User::with('wallet')->find($fundingAccount->user_id);
            }
        }

        if (!$user && !empty($customerEmail)) {
            $user = User::with('wallet')->where('email', $customerEmail)->first();
        }

        if (!$user || !$user->wallet) {
            Log::error("Zainpay webhook: User or wallet not found for account {$accountNumber} or email {$customerEmail}.");
            return;
        }

        // Calculate funded amount after applying configured gateway charges
        $chargesType = config('settings.zainpay_funding_charges', '1.6 %');
        if ($chargesType === 'settlement_amount' && $settlementAmount !== null && $settlementAmount > 0) {
            $funded_amount = $settlementAmount;
        } else {
            $charges = $helpers->applyFundingCharges($amount, $chargesType);
            $funded_amount = max(0, $amount - $charges);
        }

        try {
            DB::beginTransaction();

            $wallet = $user->wallet;
            // Lock wallet for update to guarantee concurrency safety
            $wallet = $user->wallet()->lockForUpdate()->first();

            $balance_before = $wallet->balance;
            $wallet->increment('balance', $funded_amount);
            $balance_after = $wallet->balance;

            $description = "Zainpay Deposit ₦{$amount} (Ref: {$reference})";

            Transaction::create([
                'reference_id' => $helpers->generateTransactionRef('WT'),
                'user_id' => $user->id,
                'type' => 'WALLET',
                'amount' => $amount,
                'status' => 'SUCCESS',
                'provider_name' => 'Zainpay',
                'provider_reference' => $reference,
                'api_response' => json_encode($data),
                'description' => $description,
                'balance_before' => $balance_before,
                'balance_after' => $balance_after,
                'metadata' => [
                    'ledger_type' => 'credit',
                    'method' => 'TRANSFER',
                    'payment_gateway' => 'Zainpay',
                    'account_number' => $accountNumber,
                    'settlement_amount' => $settlementAmount,
                    'funded_amount' => $funded_amount,
                    'charges' => $amount - $funded_amount,
                ],
            ]);

            DB::commit();

            Log::info("Zainpay payment credited successfully for user {$user->id} ({$user->email}): {$funded_amount} NGN.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to process Zainpay webhook transaction {$reference}: " . $e->getMessage());
            throw $e;
        }
    }
}
