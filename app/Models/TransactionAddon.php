<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TransactionAddon extends Model
{
    use HasFactory;

    protected $fillable = [
        "user_package_id",
        'amount',
        'amount_type',
        'type',
        'addonable_id',
        'addonable_type'
    ];


    public function addonable() : MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user_package that owns the TransactionAddon
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function package(): BelongsTo
    {
        return $this->belongsTo(UserPackage::class, 'user_package_id');
    }
}
