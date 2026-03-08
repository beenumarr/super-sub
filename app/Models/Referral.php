<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'referred_user_id',
        'bonus_earn',
        'valid',
        'claimed'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }


    public function getIsValidAttribute() {

       $cond1 = $this->user->transactions()->where('transactionable_type', 'App\Models\WalletTransaction')->count() > 0;
       $cond2 = $this->user->transactions()->where('transactionable_type', 'App\Models\DataTransaction')->count() > 0;
       $cond3 = $this->user->transactions()->where('transactionable_type', 'App\Models\AirtimeTransaction')->count() > 0;
       $cond4 =  $this->user->email_verified_at && true ;

        return $cond1 && ($cond2 || $cond3) && $cond4;
    }


    public function getUserFundedWalletAttribute() {


        $cond1 = $this->user->transactions()->where('transactionable_type', 'App\Models\WalletTransaction')->count() > 0;


         return $cond1;
     }


    public function getUserMadeTransactionAttribute() {


        $cond2 = $this->user->transactions()->where('transactionable_type', 'App\Models\DataTransaction')->count() > 0;
        $cond3 = $this->user->transactions()->where('transactionable_type', 'App\Models\AirtimeTransaction')->count() > 0;

         return ($cond2 || $cond3);
     }


}
