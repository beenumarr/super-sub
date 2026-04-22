<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'data_plan_type_id',
        'size',
        'volume',
        'api_plan_id',
        'validity',
        'numeric_value',
        'amount',
        'active',
        'name',
        'enable_custom_vending_api',
        'custom_api_vending_id'
    ];

    public function apis()
    {
        return $this->morphMany(ApiId::class, 'apiable');
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['data_plan_type'] ?? null, function ($query, $data_plan_type){
            $query->where('data_plan_type_id', $data_plan_type);
        })->when($filters['network'] ?? null, function ($query, $network) {
            $query->whereHas('planType', fn($q)=>$q->where('mobile_network_id', $network));
        })->when($filters['planType'] ?? null, function ($query, $planType) {
            $query->where('data_plan_type_id',  $planType);
        });
    }

    public function planType() {
        return $this->belongsTo(DataPlanType::class, 'data_plan_type_id');
    }


    public function getNetworkAttribute()
    {
        return $this->planType->network->name;
    }

    public function getUseramountAttribute()
    {
        return $this->amount;
    }






}
