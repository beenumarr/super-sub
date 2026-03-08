<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CableSubscriptionTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'cable_network_id',
        'cable_subscription_plan_id',
        'smart_card_number',
        'name',
        'phone_number'
    ];

    public function transaction()
    {
        return $this->morphOne(Transaction::class, 'transactionable');
    }

    public function plan()
    {
        return $this->belongsTo(CableSubscriptionPlan::class, 'cable_subscription_plan_id');
    }

    public function network()
    {
        return $this->belongsTo(CableNetwork::class, 'cable_network_id');
    }

    public function getDescriptionAttribute()
    {
        $plan = $this->plan?->package_name ?? "Not Available";

        return "{$plan} ({$this->transaction->amount}) {$this->network->name} Cable Subscription to {$this->smart_card_number} ({$this->name})";
    }
}
