<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CableNetwork extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'active',
        'transaction_api_id'
    ];

    public function getChargesAttribute($package_id) {
        return $this->addon()->where('user_package_id', $package_id);
    }

    public function plans() {
        return $this->hasMany(CableSubscriptionPlan::class);
    }


    public function addon() : MorphMany
    {
        return $this->morphMany(TransactionAddon::class, 'addonable');
    }

    public function getUserChargesAttribute(): TransactionAddon
    {
        // cal discount and return
        return $this->addon()->where('user_package_id', auth()->user()->user_package_id)->first();
    }

    public function applyPackageCharges($amount_to_pay)
    {
        $addon = $this->addon()->where('user_package_id', auth()->user()->user_package_id)->first();

        if (!$addon) {
            return $amount_to_pay;
        }

        $amount = $addon->amount;
        $amount_type = $addon->amount_type;
        $type = $addon->type;

        $discounted_amount = $amount;

        if ($amount_type === 'percentage') {
            $discounted_amount = $amount_to_pay * ($amount / 100);
        }

        if ($type === 'discount') {
            $new_amount = $amount_to_pay - $discounted_amount;
        }
        elseif ($type === 'charge') {
            $new_amount = $amount_to_pay + $discounted_amount;
        }

        return $new_amount;
    }

}
