<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessDailyBilling implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     * Process daily billing for all postpaid users.
     */
    public function handle(): void
    {
        Log::info('Starting daily billing process');

        // Get all postpaid users with today's usage fee > 0
        $postpaidUsers = User::where('billing_type', 'postpaid')
            ->where('today_usage_fee', '>', 0)
            ->with('wallet')
            ->get();

        $successCount = 0;
        $failureCount = 0;
        $totalProcessed = 0;
        $totalAmountBilled = 0;

        foreach ($postpaidUsers as $user) {
            try {
                DB::beginTransaction();

                $wallet = Wallet::lockForUpdate()->where('user_id', $user->id)->first();

                if (!$wallet) {
                    Log::warning('No wallet found for user during daily billing', [
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                    ]);
                    $failureCount++;
                    continue;
                }

                $todayUsageFee = $user->today_usage_fee;
                $currentBalance = $wallet->balance;
                $newBalance = $currentBalance - $todayUsageFee;

                // Deduct from wallet (can go negative)
                $wallet->balance = $newBalance;
                $wallet->save();

                // If balance goes negative, add to outstanding balance
                if ($newBalance < 0) {
                    $user->outstanding_balance += abs($newBalance);
                    $wallet->balance = 0; // Set wallet to 0
                    $wallet->save();

                    Log::warning('User balance went negative during daily billing', [
                        'user_id' => $user->id,
                        'user_email' => $user->email,
                        'previous_balance' => $currentBalance,
                        'today_usage_fee' => $todayUsageFee,
                        'negative_amount' => abs($newBalance),
                        'outstanding_balance' => $user->outstanding_balance,
                    ]);
                }

                // Create transaction record for the billing
                $reference = 'USAGE-' . strtoupper(uniqid()) . '-' . $user->id;
                Transaction::create([
                    'reference_id' => $reference,
                    'user_id' => $user->id,
                    'type' => 'WALLET',
                    'amount' => $todayUsageFee,
                    'status' => 'SUCCESS',
                    'description' => 'Daily billing - Usage fee deduction',
                    'provider_name' => 'SYSTEM',
                    'provider_reference' => $reference,
                    'api_response' => $newBalance < 0
                        ? "Billed ₦{$todayUsageFee}. Insufficient balance. ₦" . abs($newBalance) . " moved to outstanding balance."
                        : "Billed ₦{$todayUsageFee}. Balance: ₦{$newBalance}",
                    'metadata' => [
                        'billing_date' => now()->toDateString(),
                        'previous_balance' => $currentBalance,
                        'amount_billed' => $todayUsageFee,
                        'new_balance' => max(0, $newBalance),
                        'outstanding_balance' => $user->outstanding_balance,
                        'went_negative' => $newBalance < 0,
                    ],
                ]);

                // Reset today's usage fee
                $user->today_usage_fee = 0;
                $user->last_billing_date = now();
                $user->save();

                $totalProcessed += $todayUsageFee;
                $totalAmountBilled += $todayUsageFee;
                $successCount++;

                DB::commit();

                Log::info('Daily billing processed successfully', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'amount_billed' => $todayUsageFee,
                    'previous_balance' => $currentBalance,
                    'new_balance' => max(0, $newBalance),
                    'outstanding_balance' => $user->outstanding_balance,
                    'transaction_reference' => $reference,
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                $failureCount++;

                Log::error('Failed to process daily billing for user', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        Log::info('Daily billing process completed', [
            'total_users' => $postpaidUsers->count(),
            'success_count' => $successCount,
            'failure_count' => $failureCount,
            'total_amount_billed' => $totalAmountBilled,
        ]);
    }
}
