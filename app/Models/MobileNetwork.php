<?php

namespace App\Models;

use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MobileNetwork extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'data_active',
        'airtime_active',
        'api_network_id',
        'transaction_api_id',
        'airtime_transaction_api_id',
        'airtime_to_cash_active',
        'airtime_to_cash_limit',
        'airtime_to_cash_api_id',
        'a2c_conversion_rate',
        'a2c_auto_method_enabled',
        'a2c_manual_method_enabled',
    ];

    protected $casts = [
        'data_active' => 'boolean',
        'airtime_active' => 'boolean',
        'airtime_to_cash_active' => 'boolean',
        'a2c_auto_method_enabled' => 'boolean',
        'a2c_manual_method_enabled' => 'boolean',
    ];

   public function dataPlanTypes() : HasMany
   {
        return $this->hasMany(DataPlanType::class);
    }

    public function addon() : MorphMany
    {
        return $this->morphMany(TransactionAddon::class, 'addonable')->with('package');
    }

    public function getUserDiscountAttribute()
    {
        $userPackageId = auth()->user()->user_package_id;
        // Use caching if the results don't change frequently
        return Cache::remember("transaction_addons_{$this->id}_{$userPackageId}", 60, function () use ($userPackageId) {
            $this->addon()->where('user_package_id', $userPackageId)->first();
        });
    }


    public function applyPackageDiscount($amount_to_pay)
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
            $new_amount = $discounted_amount;
        }
        elseif ($type === 'charge') {
            $new_amount = -$discounted_amount;
        }

        return $new_amount;
    }

    /**
     * Check if the network has airtime to cash enabled
     */
    public function getIsA2cEnabledAttribute()
    {
        return $this->airtime_to_cash_active;
    }

    /**
     * Get the conversion rate for airtime to cash
     */
    public function getConversionRateAttribute()
    {
        return $this->a2c_conversion_rate ?? 0;
    }
}
