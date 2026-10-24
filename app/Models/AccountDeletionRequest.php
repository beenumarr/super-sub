<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountDeletionRequest extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'phone_number',
        'reason',
        'status',
        'ip_address',
        'processed_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
