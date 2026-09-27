<?php

namespace App\Actions\Utils;

use App\Models\Transaction;

class ReverseTransaction
{

    public function handle(Transaction $transaction, $response = null): void
    {
        $rawMessage = null;

        if (is_string($response)) {
            $rawMessage = $response;
        } elseif (is_array($response)) {
            if (!empty($response['error']) && is_array($response['error'])) {
                $rawMessage = implode(', ', $response['error']);
            } elseif (!empty($response['error']) && is_string($response['error'])) {
                $rawMessage = $response['error'];
            } elseif (!empty($response['msg'])) {
                $rawMessage = $response['msg'];
            } elseif (!empty($response['message'])) {
                $rawMessage = $response['message'];
            } elseif (!empty($response['api_response'])) {
                $rawMessage = $response['api_response'];
            } elseif (!empty($response['detail'])) {
                $rawMessage = $response['detail'];
            } else {
                $rawMessage = json_encode($response);
            }
        }

        if ($rawMessage === 'api' || empty($rawMessage)) {
            $rawMessage = 'Transaction failed on provider';
        }

        $transaction->fill([
            'status' => 'FAILED',
            'api_response' => $rawMessage,
        ])->save();

        $wallet = $transaction->user?->wallet;
        if ($wallet) {
            $wallet->increment('balance', (float) $transaction->amount);
        }

        if (!is_null($transaction->balance_after)) {
            $transaction->increment('balance_after', (float) $transaction->amount);
        }
    }


}
