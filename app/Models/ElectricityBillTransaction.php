<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ElectricityBillTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'meter_number',
        'electricity_distributor_id',
        'meter_type',
        'name',
        'amount',
        'address',
        'phone_number',
        'token'
    ];


    public function transaction()
    {
        return $this->morphOne(Transaction::class, 'transactionable');
    }

    public function distributor()
    {
        return $this->belongsTo(ElectricityDistributor::class, 'electricity_distributor_id');
    }

    public function getDescriptionAttribute()
    {
        return "{$this->transaction->amount} {$this->distributor->name} Bill Payment  to {$this->meter_number} ({$this->name})";
    }
}
