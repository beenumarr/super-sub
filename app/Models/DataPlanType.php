<?php

namespace App\Models;

use App\Models\DataPlan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DataPlanType extends Model
{
    use HasFactory;

    protected $fillable = [
        'mobile_network_id',
        'name',
        'code',
        'active',
        "transaction_api_id"
    ];

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['mobile_network'] ?? null, function ($query, $mobile_network){
            $query->where('mobile_network_id', $mobile_network);
        });
    }

    public function dataPlans() {
        return $this->hasMany(DataPlan::class);
    }

    public function network()
    {
        return $this->belongsTo(MobileNetwork::class, 'mobile_network_id')->with('addon');
    }

    public function api()
    {
        return $this->belongsTo(TransactionApi::class, 'transaction_api_id');
    }




}
