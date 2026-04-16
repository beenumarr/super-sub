<?php

namespace App\Actions\Utils;

use DateTimeZone;
use Carbon\Carbon;
use App\Models\Transaction;

class TransactionHelpers
{


    public function generateVtPassRequestId() {
        $currentDateTime = Carbon::now(new DateTimeZone('Africa/Lagos'));
        $datePortion = $currentDateTime->format('YmdHi');
        $additionalString = substr(uniqid(), 2, 12);

        $requestId = $datePortion . $additionalString;
        if (strlen($requestId) < 12) {
            throw new \InvalidArgumentException('Request ID length must be 12 characters or more.');
        }

        return $requestId;

    }



    public function reverseTransaction(Transaction $transaction, $response = null): void
    {

        $transaction->update([
            'status' => 'FAILED',
            'api_response' => $response ?? 'No Response',
        ]);

        $wallet = $transaction->user?->wallet;
        if ($wallet) {
            $wallet->increment('balance', (float) $transaction->amount);
        }

        if (!is_null($transaction->balance_after)) {
            $transaction->increment('balance_after', (float) $transaction->amount);
        }

    }


}
