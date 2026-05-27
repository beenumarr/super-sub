<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'settings',
        'user_config',
        'phone_number',
        'api_token',
        'api_key',
        'user_category_id',
        'kyc_level',
        'webhook_url',
        'address',
        'original_token',
        'username',
        'referal_username',
        'last_login',
        'last_login_ip',
        'active',
        'user_package_id',
        'kyc_verified_at',
        'bvn',
        'nin',
        'account_status',
        'bank_account_number',
        'bank_account_name',
        'bank_account_bank',
        'bank_account_bank_code',
        'transaction_pin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'transaction_pin',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'transaction_pin' => 'hashed',
        'settings' => 'json',
        'user_config' => 'json',
    ];

    /**
     * Filter the query based on request filters
     *
     * @param $query
     * @param array $filters
     * @return void
     */
    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where('name', 'like', '%'.$search.'%')
                ->orWhere('email', 'like', '%'.$search.'%')
                ->orWhere('phone_number', 'like', '%'.$search.'%');
        })
        ->when($filters['user_id'] ?? null, function ($query, $user_id) {
            $query->where('id', $user_id);
        })
        ->when($filters['status'] ?? null, function ($query, $status) {
            $query->where('active', $status === 'active' ? 1 : 0);
        })
        ->when($filters['role'] ?? null, function ($query, $role) {
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        })
        ->when($filters['package'] ?? null, function ($query, $package) {
            $query->where('user_package_id', $package);
        })
        ->when($filters['trashed'] ?? null, function ($query, $trashed) {
            if ($trashed === 'only') {
                $query->onlyTrashed();
            } elseif ($trashed === 'with') {
                $query->withTrashed();
            }
        });
    }

    /**
     * Get the count of phone numbers associated with the user.
     *
     * @return int
     */

    public function transactions() : HasMany {
        return $this->hasMany(Transaction::class);
    }



    public function package() {
        return $this->belongsTo(UserPackage::class, 'user_package_id');
    }


    public function wallet() {
        return $this->hasOne(Wallet::class);
    }

    public function fundingAccounts() {
        return $this->hasMany(FundingAccount::class);
    }



    public function category()
    {
        return $this->belongsTo(UserCategory::class, 'user_category_id');
    }


    public function getCanAttribute()
    {
        $permissions = [];
        foreach (Permission::all() as $permission) {
            if ($this->can($permission->name)) {
                $permissions[$permission->name] = true;
            } else {
                $permissions[$permission->name] = false;
            }
        }
        return $permissions;
    }

    public function getRoleAttribute()
    {
        return $this->roles->isNotEmpty()  ? $this->roles->first()->only('id', 'name') : null;
    }

    public function getIsAdminAttribute(): bool
    {
        return $this->hasRole(['Admin', 'Superadmin','Masteradmin']);
    }

    public function getIsSuperAdminAttribute(): bool
    {
        return $this->hasRole(['Superadmin', 'Masteradmin']);
    }

    public function hasTransactionPin(): bool
    {
        $raw = $this->getRawOriginal('transaction_pin');
        return !empty($raw) && $raw !== 'NULL';
    }

    public function verifyTransactionPin(?string $pin): bool
    {
        if (!$this->hasTransactionPin() || $pin === null) {
            return false;
        }

        $storedPin = (string) $this->getRawOriginal('transaction_pin');

        if (Hash::isHashed($storedPin)) {
            return Hash::check($pin, $storedPin);
        }

        // Legacy support: old records may still have a plain 4-digit PIN.
        if (hash_equals($storedPin, $pin)) {
            $this->forceFill(['transaction_pin' => $pin])->saveQuietly();
            return true;
        }

        return false;
    }

}
