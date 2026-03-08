<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FundingAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bank_code',
        'bank_name',
        'account_name',
        'account_number',
        'active',
        'reference',
        'gateway',
        'account_type',
        'expire_date'
    ];
}
