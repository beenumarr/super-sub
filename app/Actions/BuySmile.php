<?php

namespace App\Actions;

use App\Models\Transaction;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;
use App\Actions\APIs\ArewaGlobal\Data;

class BuySmile
{
    /**
     * Handle the Smile bundle purchase.
     */
    public function handle(Transaction $transaction, TransactionApi $api = null, $actype): string
    {
        try {
            $dataAction = new Data();

            return $dataAction->handle($transaction, $transaction->transactionable, $api, $actype);

        } catch (\Exception $e) {
            Log::error('BuySmile Error: ' . $e->getMessage());

            $transaction->update([
                'status' => 'failed',
                'api_response' => 'Something went wrong. Please try again later.',
            ]);

            return 'failed';
        }
    }
}
