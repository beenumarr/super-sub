<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

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

    /**
     * The attributes that should be encrypted
     */
    protected $encrypted = [
        'token',
        'secret_key',
        'public_key',
        'username',
        'password',
    ];

    /**
     * Set encrypted attributes
     */
    public function setAttribute($key, $value)
    {
        if (in_array($key, $this->encrypted) && !empty($value)) {
            $value = cs_encrypt($value);
        }
        return parent::setAttribute($key, $value);
    }

    /**
     * Get encrypted attributes
     */
    public function getAttribute($key)
    {
        $value = parent::getAttribute($key);
        if (in_array($key, $this->encrypted) && !empty($value)) {
            $value = cs_decrypt($value);
        }
        return $value;
    }
}
