<?php

namespace App\Actions\Utils;

use App\Models\Transaction;




class ReverseTransaction
{


    public function handle(Transaction $transaction, $response = null): void
    {



        if($response === 'api'){
            $transaction->update([
                'status'=> 'failed',
            ]);

        }else{

            $transaction->update([
                'status'=> 'failed',
                'api_response'=> $response['message'] ?? $response['api_response'] ?? 'No Response'
            ]);

        }

        $wallet = auth()->user()->wallet;
        $wallet->increment('balance', $transaction->amount);
        $transaction->increment('balance_after', floatval($transaction->amount));

    }


}
