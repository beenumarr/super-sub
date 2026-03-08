<?php

namespace App\Models;

use App\Traits\DateScopes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory, DateScopes;

    protected $fillable = [
        'user_id',
        'description',
        'transactionable_id',
        'transactionable_type',
        'balance_before',
        'vending_medium',
        'transaction_channel',
        'balance_after',
        'api_response',
        'reference',
        'request_ip',
        'status',
        'amount',
        'api_reference'
    ];

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->whereNot('transactionable_type', "App\Models\WalletTransaction")
                ->whereHas('transactionable', function ($q) use ($search) {
                    $modelName = $q->getModel()->getMorphClass();
                    if (!in_array($modelName, ["App\Models\WalletTransaction", "App\Models\CableSubscriptionTransaction", "App\Models\BonusWalletTransaction","App\Models\ResultCheckerTransaction"])) {
                        $q->where('phone_number', 'like', '%'.$search.'%')
                          ->orWhere('reference', 'like', '%'.$search.'%');
                    } else {
                        $q->where('reference', 'like', '%'.$search.'%');
                    }
                });
        })
        ->when($filters['user_id'] ?? null, function ($query, $user_id) {
            $query->where('user_id', $user_id);
        })
        ->when($filters['status'] ?? null, function ($query, $status) {
            $query->where('status', $status);
        });
    }

    public function transactionable()
    {
        return $this->morphTo();
    }

    public function scopeWithPlanAndNetwork($query)
    {
        return $query->with(['transactionable.plan', 'transactionable.network'])->where('transactionable_type', 'App\Models\DataTransaction');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }


}
