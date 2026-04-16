<?php

namespace App\Actions\Utils;

use App\Models\Transaction;

class ReverseTransaction
{

    public function handle(Transaction $transaction, $response = null): void
    {
        if ($response === 'api') {
            $transaction->update([
                'status' => 'FAILED',
            ]);

        } else {
            $transaction->update([
                'status' => 'FAILED',
                'api_response' => $response['message'] ?? $response['api_response'] ?? 'No Response',
            ]);

        }

        $wallet = $transaction->user?->wallet;
        if ($wallet) {
            $wallet->increment('balance', (float) $transaction->amount);
        }

        if (!is_null($transaction->balance_after)) {
            $transaction->increment('balance_after', (float) $transaction->amount);
        }

    }


}
