<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promotion extends Model
{
    protected $fillable = [
        'code',
        'reward_amount',
        'max_redemptions',
        'redeemed_count',
        'is_active',
        'starts_at',
        'ends_at',
        'created_by',
    ];

    protected $casts = [
        'reward_amount' => 'decimal:2',
        'max_redemptions' => 'integer',
        'redeemed_count' => 'integer',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function redemptions(): HasMany
    {
        return $this->hasMany(PromotionRedemption::class);
    }

    public function remainingRedemptions(): int
    {
        return max(0, (int) $this->max_redemptions - (int) $this->redeemed_count);
    }
}

