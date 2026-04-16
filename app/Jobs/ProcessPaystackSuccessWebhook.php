<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPaystackSuccessWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $payload;

    /**
     * Create a new job instance.
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
        $data = $this->payload['data'] ?? [];

        $reference = $data['reference'] ?? null;
        $amount = $data['amount'] ?? 0;
        $email = $data['customer']['email'] ?? null;

        Log::info("Processing Paystack webhook for reference: $reference");

        if (!$reference || !$email || !$amount) {
            Log::error("Missing data in webhook payload: ", $this->payload);
            return;
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            Log::error("User not found for email: {$email}");
            return;
        }

        $existing = Transaction::where('reference_id', $reference)->first();

        if ($existing) {
            // Prevent duplicate processing
            if ($existing->status !== 'SUCCESS') {
                $existing->update([
                    'status' => 'SUCCESS',
                    'api_response' => 'Confirmed by webhook',
                ]);

                $this->processWalletFunding($user, $amount / 100);
                Log::info("Updated existing transaction and funded wallet.");
            }

            return;
        }

        // Create new transaction
        $wallet = $user->wallet;
        $balanceBefore = (float) ($wallet?->balance ?? 0);

        Transaction::create([
            'reference_id' => $reference,
            'user_id' => $user->id,
            'type' => 'WALLET',
            'amount' => $amount / 100,
            'status' => 'SUCCESS',
            'description' => 'Wallet funding via Paystack',
            'provider_name' => 'Paystack',
            'provider_reference' => $reference,
            'api_response' => 'Auto-created from webhook',
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceBefore + ($amount / 100),
            'metadata' => array_merge($data, [
                'ledger_type' => 'credit',
                'method' => 'WALLET_FUNDING',
                'payment_gateway' => 'Paystack',
            ]),
        ]);

        $this->processWalletFunding($user, $amount / 100);

        Log::info("Wallet funded successfully for user {$user->id} (₦" . ($amount / 100) . ")");
    }

    /**
     * Process wallet funding and handle outstanding balance
     */
    private function processWalletFunding(User $user, float $amount): void
    {
        $outstandingBalance = $user->outstanding_balance ?? 0;

        if ($outstandingBalance > 0) {
            if ($amount >= $outstandingBalance) {
                // Clear outstanding balance and add remaining to wallet
                $remainingAmount = $amount - $outstandingBalance;

                $user->outstanding_balance = 0;
                $user->save();

                $user->wallet()->increment('balance', $remainingAmount);

                // Create transaction record for outstanding balance clearance
                $reference = 'OUTSTANDING-CLEAR-' . strtoupper(uniqid()) . '-' . $user->id;
                Transaction::create([
                    'reference_id' => $reference,
                    'user_id' => $user->id,
                    'type' => 'WALLET',
                    'amount' => $outstandingBalance,
                    'status' => 'SUCCESS',
                    'description' => 'Outstanding balance cleared from wallet funding',
                    'provider_name' => 'SYSTEM',
                    'provider_reference' => $reference,
                    'api_response' => "Outstanding balance of ₦{$outstandingBalance} cleared. ₦{$remainingAmount} added to wallet.",
                    'metadata' => [
                        'ledger_type' => 'debit',
                        'method' => 'BILLING',
                        'funded_amount' => $amount,
                        'outstanding_cleared' => $outstandingBalance,
                        'added_to_wallet' => $remainingAmount,
                        'payment_type' => 'full_clear',
                    ],
                ]);

                Log::info("Outstanding balance cleared and wallet funded", [
                    'user_id' => $user->id,
                    'funded_amount' => $amount,
                    'outstanding_cleared' => $outstandingBalance,
                    'added_to_wallet' => $remainingAmount,
                ]);
            } else {
                // Partially pay outstanding balance
                $remainingOutstanding = $user->outstanding_balance - $amount;
                $user->outstanding_balance -= $amount;
                $user->save();

                // Create transaction record for partial outstanding balance payment
                $reference = 'OUTSTANDING-PARTIAL-' . strtoupper(uniqid()) . '-' . $user->id;
                Transaction::create([
                    'reference_id' => $reference,
                    'user_id' => $user->id,
                    'type' => 'WALLET',
                    'amount' => $amount,
                    'status' => 'SUCCESS',
                    'description' => 'Partial outstanding balance payment from wallet funding',
                    'provider_name' => 'SYSTEM',
                    'provider_reference' => $reference,
                    'api_response' => "Partial payment of ₦{$amount} applied to outstanding balance. Remaining: ₦{$remainingOutstanding}",
                    'metadata' => [
                        'ledger_type' => 'debit',
                        'method' => 'BILLING',
                        'funded_amount' => $amount,
                        'outstanding_paid' => $amount,
                        'remaining_outstanding' => $remainingOutstanding,
                        'payment_type' => 'partial_payment',
                    ],
                ]);

                Log::info("Partially paid outstanding balance", [
                    'user_id' => $user->id,
                    'funded_amount' => $amount,
                    'outstanding_paid' => $amount,
                    'remaining_outstanding' => $user->outstanding_balance,
                ]);
            }
        } else {
            // No outstanding balance, add full amount to wallet
            $user->wallet()->increment('balance', $amount);

            Log::info("Full amount added to wallet", [
                'user_id' => $user->id,
                'amount' => $amount,
            ]);
        }
    }
}
