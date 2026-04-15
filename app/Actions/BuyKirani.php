<?php

namespace App\Actions;

use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use App\Actions\APIs\Kirani\PurchaseMinutes;

class BuyKirani
{
    /**
     * Handle the Kirani minutes purchase.
     */
    public function handle(Transaction $transaction): string
    {
        try {
            $purchaseMinutes = new PurchaseMinutes();
            
            return $purchaseMinutes->handle($transaction, $transaction->transactionable);
            
        } catch (\Exception $e) {
            Log::error('BuyKirani Error: ' . $e->getMessage());
            
            $transaction->update([
                'status' => 'FAILED',
                'api_response' => 'Something went wrong. Please try again later.',
            ]);
            
            return 'FAILED';
        }
    }
}
