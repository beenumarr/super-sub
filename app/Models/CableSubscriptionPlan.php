<?php

namespace App\Models;

use App\Models\ApiId;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CableSubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'cable_network_id',
        'product_code',
        'package_name',
        'validity',
        'amount',
        'active',
    ];

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['network'] ?? null, function ($query, $network){
            $query->where('cable_network_id', $network);
        });
    }

    public function cableProvider() {
        return $this->belongsTo(CableNetwork::class, 'cable_network_id');
    }

    public function apis()
    {
        return $this->morphMany(ApiId::class, 'apiable');
    }



}
