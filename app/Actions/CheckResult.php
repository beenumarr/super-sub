<?php

namespace App\Actions;

use GuzzleHttp\Client;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;

class CheckResult
{
    public function handle(Transaction $transaction)
    {
        if (config('app.test_mode')) {
            $transaction->update([
                'status' => 'success',
                'api_response' => 'Success Test Mode'
            ]);

            return 'success';
        }
    }
}