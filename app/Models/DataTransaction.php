<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DataTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'data_plan_id',
        'description',
        'phone_number',
        'mobile_network_id',
        'actype',
    ];


    public function transaction()
    {
        return $this->morphOne(Transaction::class, 'transactionable');
    }

    public function network()
    {
        return $this->belongsTo(MobileNetwork::class, 'mobile_network_id');
    }

    public function plan()
    {
        return $this->belongsTo(DataPlan::class, 'data_plan_id');
    }

    public function getDescriptionAttribute()
    {
        // Eager load relationships to avoid N+1 query problem
        $plan = $this->plan;
        $network = $this->network;

        // Use null coalescing to handle cases where plan or network might be null
        $planSize = $plan ? $plan->size : 'Unknown Size';
        $planVolume = $plan ? Str::upper($plan->volume) : 'Unknown Volume';
        $networkName = $network ? $network->name : 'Unknown Network';

        return "{$planSize} {$planVolume} Data {$networkName} to {$this->phone_number}";
    }

}
