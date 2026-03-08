<?php

namespace App\Actions\Promo;

use App\Models\User;
use App\Models\Transaction;
use App\Models\BonusWalletTransaction;

class FundBonusWallet
{


    public function handle($data, $desc, User $user)
    {


        $wallet = $user->wallet;

        $balance_before = $wallet->bonus_balance;

        $wallet->increment('bonus_balance', $data['amount']);

        $balance_after = $wallet->bonus_balance;


         // Store Transaction Records
        $transactionable = BonusWalletTransaction::create([
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'amount' => $data['amount'],
            'type'=> 'credit',
            'method'=> 'SINGUP_BONUS_AND_REFERRAL',
        ]);

        // Store General Transaction
       $transaction = $transactionable->transaction()->create([
            'reference'=> $this->generateRef(),
            'user_id' => $user->id,
            'amount' => $data['amount'],
            'status' => 'success',
            'api_response'=> $desc,
            'balance_before'=> $balance_before,
            'balance_after'=> $balance_after,
        ]);


        return $transaction;

    }


    private function generateRef() {
        $number = 'BWT'.now()->month.now()->year.mt_rand(100000, 999999);
        if (Transaction::wherereference($number)->exists()){
            return $this->generateRef();
        }
        return $number;
    }

}

