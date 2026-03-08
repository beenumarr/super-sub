<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'type',
        'note',
        'amount',
        'method',
        'payment_gateway'
    ];

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->whereHas('transaction', function($query) use($search){
               return $query->where('api_response', 'like', '%'.$search.'%')->orWhere('reference', 'like', '%'.$search.'%');;
            });
        })->when($filters['user_id'] ?? null, function ($query, $user_id) {
            $query->whereHas('transaction', function($query)use( $user_id){
                return $query->where('user_id', $user_id);
            });
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transaction()
    {
        return $this->morphOne(Transaction::class, 'transactionable')->with('user');
    }


    // add observer to check anytime this created or updated
    // check if user->kyc_verified_at = null then check user->wallet->balance >= config('settings.temp_account_limit');
    // update the user->account_status = restricted

}
