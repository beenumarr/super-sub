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
        'smart_earner_amount',
        'affiliate_amount',
        'top_user_amount',
        'api_amount',
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
        $package = auth()->user()->user_package_id;

        $amount = $this->amount;

        if($package === 1){
            $amount = $this->smart_earner_amount ?? $this->amount;
        }
        if($package === 2){
            $amount = $this->affiliate_amount ?? $this->amount;
        }

        if($package === 3){
            $amount = $this->top_user_amount ?? $this->amount;
        }

        if($package === 4){
            $amount = $this->api_amount ?? $this->amount;
        }

        return $amount;
    }






}
