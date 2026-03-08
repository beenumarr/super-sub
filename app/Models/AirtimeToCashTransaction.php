<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AirtimeToCashTransaction extends Model
{
    use HasFactory;


    protected $fillable = [
        'user_id',
        'phone_number',
        'mobile_network_id',
        'amount',
        'quantity',
        'success',
        'failed',
        'unsure',
        'sessionId',
        'api_reference',
        'api_response',
        'reference',
        'status',
        'recieverPhone',
        'converted_amount',
        'convertion_rate',
    ];

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where('phone_number', 'like', '%'.$search.'%')
            ->orWhere('reference', 'like', '%'.$search.'%');
        })
        ->when($filters['user_id'] ?? null, function ($query, $user_id) {
            $query->where('user_id', $user_id);
        })
        ->when($filters['status'] ?? null, function ($query, $status) {
            $query->where('status', $status);
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function network()
    {
        return $this->belongsTo(MobileNetwork::class, 'mobile_network_id');
    }

    public function getDescriptionAttribute()
    {
        return "{$this->amount} {$this->network->name} Airtime to {$this->phone_number}";
    }
}
