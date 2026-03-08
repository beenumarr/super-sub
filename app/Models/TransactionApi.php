<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionApi extends Model
{
    use HasFactory;

    protected $fillable =  [
        'name',
        'url',
        'token',
        'secret_key',
        'public_key',
        'username',
        'password',
        'model',
        'mtn_service_id',
        'airtel_service_id',
        'glo_service_id',
        'ninemobile_service_id',
    ];
}
