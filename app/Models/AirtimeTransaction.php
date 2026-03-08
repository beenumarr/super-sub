<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AirtimeTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone_number',
        'mobile_network_id',
        'amount',
    ];

    public function transaction()
    {
        return $this->morphOne(Transaction::class, 'transactionable');
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
