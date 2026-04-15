<?php

namespace App\Actions\Promo;

use App\Models\User;
use App\Models\Transaction;

class FundBonusWallet
{


    public function handle($data, $desc, User $user)
    {


        $wallet = $user->wallet;

        $balance_before = $wallet->bonus_balance;

        $wallet->increment('bonus_balance', $data['amount']);

        $balance_after = $wallet->bonus_balance;


        $transaction = Transaction::create([
            'reference_id' => $this->generateRef(),
            'user_id' => $user->id,
            'type' => 'BONUS_WALLET',
            'amount' => $data['amount'],
            'status' => 'SUCCESS',
            'provider_name' => 'SYSTEM',
            'provider_reference' => 'BONUS',
            'api_response' => $desc,
            'description' => $desc,
            'balance_before' => $balance_before,
            'balance_after' => $balance_after,
            'metadata' => [
                'ledger_type' => 'credit',
                'method' => 'SIGNUP_BONUS_AND_REFERRAL',
                'wallet_type' => 'bonus_balance',
            ],
        ]);


        return $transaction;

    }


    private function generateRef() {
        $number = 'BWT'.now()->month.now()->year.mt_rand(100000, 999999);
        if (Transaction::where('reference_id', $number)->exists()){
            return $this->generateRef();
        }
        return $number;
    }

}
