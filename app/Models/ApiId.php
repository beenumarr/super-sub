<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiId extends Model
{
    use HasFactory;


    protected $fillable = [
        'apiable_id',
        'apiable_id',
        'product_id',
        'product_code',
        'transaction_api_id',
    ];


    public function apiable()
    {
        return $this->morphTo();
    }


}
