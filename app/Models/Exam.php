<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = [
        'name',
        'price',
        'active',
    ];

    // Define any relationships or additional methods here
}