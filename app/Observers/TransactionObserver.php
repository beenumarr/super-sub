<?php

namespace App\Observers;

use App\Models\Transaction;
use App\Services\Firebase\FcmService;
use Illuminate\Support\Facades\Log;

class TransactionObserver
{
    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        try {
            if (!FcmService::isConfigured()) {
                return;
            }

            // 1. Wallet Funding / Deposit
            if ($transaction->type === 'WALLET') {
                $isCredit = ($transaction->metadata['ledger_type'] ?? '') === 'credit'
                    || ($transaction->balance_after >= $transaction->balance_before && $transaction->amount > 0);

                if ($isCredit) {
                    $title = 'Wallet Credited';
                    $formattedAmount = number_format((float) $transaction->amount, 2);
                    $formattedBalance = number_format((float) $transaction->balance_after, 2);
                    $body = "Your wallet has been credited with NGN {$formattedAmount}. Current balance: NGN {$formattedBalance}.";

                    FcmService::sendToUser($transaction->user_id, $title, $body, [
                        'type' => 'WALLET',
                        'reference' => (string) $transaction->reference_id,
                        'amount' => (string) $transaction->amount,
                    ]);
                }
                return;
            }

            // 2. Service Transactions (Airtime, Data, Cable, Electricity, Result Checker)
            if ($transaction->status === 'SUCCESS') {
                $title = 'Transaction Successful';
                $body = $this->buildSuccessBody($transaction);

                FcmService::sendToUser($transaction->user_id, $title, $body, [
                    'type' => (string) $transaction->type,
                    'reference' => (string) $transaction->reference_id,
                    'amount' => (string) $transaction->amount,
                ]);
            } elseif ($transaction->status === 'FAILED') {
                $title = 'Transaction Failed';
                $body = "Your {$transaction->type} transaction of NGN " . number_format((float) $transaction->amount, 2) . " was unsuccessful.";

                FcmService::sendToUser($transaction->user_id, $title, $body, [
                    'type' => (string) $transaction->type,
                    'reference' => (string) $transaction->reference_id,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('TransactionObserver FCM Error: ' . $e->getMessage());
        }
    }

    /**
     * Handle the Transaction "updated" event.
     */
    public function updated(Transaction $transaction): void
    {
        try {
            if (!FcmService::isConfigured()) {
                return;
            }

            if ($transaction->wasChanged('status')) {
                $newStatus = $transaction->status;
                $originalStatus = $transaction->getOriginal('status');

                if ($originalStatus === 'PENDING' && $newStatus === 'SUCCESS') {
                    $title = 'Transaction Successful';
                    $body = $this->buildSuccessBody($transaction);

                    FcmService::sendToUser($transaction->user_id, $title, $body, [
                        'type' => (string) $transaction->type,
                        'reference' => (string) $transaction->reference_id,
                        'amount' => (string) $transaction->amount,
                    ]);
                } elseif ($originalStatus === 'PENDING' && $newStatus === 'FAILED') {
                    $title = 'Transaction Failed';
                    $body = "Your {$transaction->type} transaction of NGN " . number_format((float) $transaction->amount, 2) . " failed and funds have been reversed.";

                    FcmService::sendToUser($transaction->user_id, $title, $body, [
                        'type' => (string) $transaction->type,
                        'reference' => (string) $transaction->reference_id,
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::error('TransactionObserver FCM Update Error: ' . $e->getMessage());
        }
    }

    /**
     * Format a clean, informative body without any emojis.
     */
    protected function buildSuccessBody(Transaction $transaction): string
    {
        $amountStr = 'NGN ' . number_format((float) $transaction->amount, 2);

        if (!empty($transaction->description)) {
            $body = $transaction->description;
        } else {
            $body = "Your {$transaction->type} purchase of {$amountStr} was processed successfully.";
        }

        // Include prepaid electricity token if present
        $metadata = $transaction->metadata ?? [];
        if (!empty($metadata['token'])) {
            $body .= " Token: " . $metadata['token'];
        }

        // Include exam PIN if present
        if (!empty($metadata['pins'])) {
            $body .= " PIN: " . (is_array($metadata['pins']) ? implode(', ', $metadata['pins']) : $metadata['pins']);
        }

        return FcmService::cleanText($body);
    }
}
