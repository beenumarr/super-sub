<?php

namespace App\Models;

use App\Traits\DateScopes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory, DateScopes;

    public const ACTIVE_TYPES = [
        'DATA',
        'AIRTIME',
        'CABLE',
        'ELECTRICITY',
        'RESULT_CHECKER',
        'WALLET',
        'BONUS_WALLET',
        'NIN_VERIFICATION',
        'BVN_VERIFICATION',
    ];

    protected $fillable = [
        'reference_id',
        'provider_name',
        'provider_id',
        'provider_reference',
        'api_response',
        'user_id',
        'type',
        'amount',
        'description',
        'status',
        'metadata',
        'webhook_sent',
        'webhook_response_body',
        'webhook_retry_count',
        'webhook_sent_at',
        'webhook_last_attempt_at',
        'api_process_started_at',
        'api_response_received_at',
        'api_process_duration',
        'transaction_duration',
        'telco_price',
        'full_size',
        'dispense_channel',
        'product_category',
        'product_id',
        'service_fee',

        // Legacy/audit fields kept as real columns.
        'balance_before',
        'balance_after',
        'request_ip',
        'vending_medium',
        'transaction_channel',

        // Legacy identifiers kept for backward compatibility/backfill.
        'reference',
        'api_reference',
    ];

    protected $casts = [
        'metadata' => 'array',
        'webhook_sent' => 'boolean',
        'webhook_sent_at' => 'datetime',
        'webhook_last_attempt_at' => 'datetime',
        'api_process_started_at' => 'datetime',
        'api_response_received_at' => 'datetime',
        'amount' => 'decimal:2',
        'telco_price' => 'decimal:2',
        'service_fee' => 'decimal:2',
    ];

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_id', 'like', '%'.$search.'%')
                    ->orWhere('reference', 'like', '%'.$search.'%')
                    ->orWhere('provider_reference', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('metadata->beneficiary', 'like', '%'.$search.'%');
            });
        })->when($filters['user_id'] ?? null, function ($query, $user_id) {
            $query->where('user_id', $user_id);
        })
        ->when($filters['status'] ?? null, function ($query, $status) {
            $query->where('status', strtoupper((string) $status));
        })
        ->when($filters['type'] ?? null, function ($query, $type) {
            $query->where('type', strtoupper((string) $type));
        })
        ->when($filters['network'] ?? null, function ($query, $network) {
            $query->where(function ($q) use ($network) {
                $q->where('provider_name', $network)
                    ->orWhereJsonContains('metadata->network', $network);
            });
        });
    }

    public function scopeWithoutLegacy($query)
    {
        return $query
            ->whereIn('type', self::ACTIVE_TYPES)
            ->whereNotNull('reference_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Backwards-compatible accessor for legacy code that expects
     * `$transaction->transactionable` (previously a morphTo relation).
     *
     * This returns an in-memory model instance built from `type` + `metadata`,
     * without relying on per-service transaction tables.
     */
    public function getTransactionableAttribute()
    {
        $metadata = $this->metadata ?? [];

        switch (strtoupper((string) $this->type)) {
            case 'DATA': {
                $model = new DataTransaction([
                    'phone_number' => $metadata['beneficiary'] ?? null,
                    'mobile_network_id' => (int) ($this->provider_id ?? ($metadata['network_id'] ?? 0)),
                    'data_plan_id' => (int) ($this->product_id ?? ($metadata['plan_id'] ?? 0)),
                    'actype' => $metadata['actype'] ?? null,
                ]);
                $model->setRelation('transaction', $this);
                return $model;
            }

            case 'AIRTIME': {
                $model = new AirtimeTransaction([
                    'phone_number' => $metadata['beneficiary'] ?? null,
                    'mobile_network_id' => (int) ($this->provider_id ?? ($metadata['network_id'] ?? 0)),
                    'amount' => $metadata['requested_amount'] ?? (float) $this->amount,
                ]);
                $model->setRelation('transaction', $this);
                return $model;
            }

            case 'CABLE': {
                $model = new CableSubscriptionTransaction([
                    'cable_network_id' => (int) ($this->provider_id ?? ($metadata['network_id'] ?? 0)),
                    'cable_subscription_plan_id' => (int) ($this->product_id ?? ($metadata['plan_id'] ?? 0)),
                    'smart_card_number' => $metadata['smart_card_number'] ?? null,
                    'name' => $metadata['name'] ?? null,
                    'phone_number' => $metadata['phone_number'] ?? null,
                ]);
                $model->setRelation('transaction', $this);
                return $model;
            }

            case 'ELECTRICITY': {
                $model = new ElectricityBillTransaction([
                    'electricity_distributor_id' => (int) ($this->provider_id ?? ($metadata['electricity_distributor_id'] ?? 0)),
                    'meter_number' => $metadata['meter_number'] ?? null,
                    'meter_type' => $metadata['meter_type'] ?? null,
                    'name' => $metadata['name'] ?? null,
                    'address' => $metadata['address'] ?? null,
                    'phone_number' => $metadata['phone_number'] ?? null,
                    'token' => $metadata['token'] ?? null,
                ]);
                $model->setRelation('transaction', $this);
                return $model;
            }

            case 'RESULT_CHECKER': {
                $model = new ResultCheckerTransaction([
                    'exam_type_id' => (int) ($this->provider_id ?? ($metadata['exam_type_id'] ?? 0)),
                    'exam_type' => $metadata['exam_type'] ?? null,
                    'quantity' => (int) ($metadata['quantity'] ?? 1),
                    'pins' => $metadata['pins'] ?? null,
                ]);
                $model->setRelation('transaction', $this);
                return $model;
            }

            default:
                return null;
        }
    }

    public function setStatusAttribute($value): void
    {
        $this->attributes['status'] = strtoupper((string) $value);
    }

    public function getStatusColorAttribute(): string
    {
        return [
            'PENDING' => 'yellow',
            'SUCCESS' => 'green',
            'FAILED' => 'red',
            'REFUNDED' => 'purple',
        ][$this->status] ?? 'gray';
    }

    public function getFormattedAmountAttribute(): string
    {
        return '₦' . number_format((float) $this->amount, 2);
    }

    public function getBeneficiaryAttribute(): ?string
    {
        $metadata = $this->metadata ?? [];
        return $metadata['beneficiary'] ?? null;
    }

    public function getReferenceIdAttribute($value): ?string
    {
        return $value ?: ($this->attributes['reference'] ?? null);
    }

    public function getReferenceAttribute($value): ?string
    {
        return $value ?: ($this->attributes['reference_id'] ?? null);
    }

    public function getUserFriendlyResponseAttribute(): string
    {
        if ($this->status === 'SUCCESS') {
            return $this->api_response ?: 'Transaction Successful';
        }

        if (empty($this->api_response) || $this->api_response === 'No Response' || $this->api_response === 'Transaction failed on provider') {
            return 'Transaction could not be completed at this time. Your wallet has been refunded.';
        }

        $lower = strtolower($this->api_response);

        // Phone number issues
        if (str_contains($lower, 'invalid phone') || str_contains($lower, 'phone number is invalid') || str_contains($lower, 'wrong phone')) {
            return 'The phone number provided is invalid. Please verify and try again.';
        }

        // Out of stock / unavailable on provider SIM pool
        if (str_contains($lower, 'no phone number available') || str_contains($lower, 'out of stock') || str_contains($lower, 'temporarily unavailable') || str_contains($lower, 'route unavailable') || str_contains($lower, 'vending unavailable')) {
            return 'This service is temporarily unavailable on the selected network. Please try again shortly or use another network. Your wallet has been refunded.';
        }

        // Plan issues
        if (str_contains($lower, 'plan not found') || str_contains($lower, 'invalid plan') || str_contains($lower, 'plan unavailable')) {
            return 'The selected plan is temporarily unavailable. Please choose another plan or try again later. Your wallet has been refunded.';
        }

        // Meter or IUC validation issues
        if (str_contains($lower, 'meter') && (str_contains($lower, 'invalid') || str_contains($lower, 'not found'))) {
            return 'Invalid meter number. Please verify your meter details.';
        }
        if ((str_contains($lower, 'iuc') || str_contains($lower, 'smartcard')) && (str_contains($lower, 'invalid') || str_contains($lower, 'not found'))) {
            return 'Invalid smartcard / IUC number. Please verify your details.';
        }

        // Provider technical errors (Balance, SSL, Guzzle, 400, 500, cURL, etc.)
        if (str_contains($lower, 'insufficient') || str_contains($lower, 'balance') || str_contains($lower, 'curl') || str_contains($lower, 'ssl') || str_contains($lower, 'exception') || str_contains($lower, '500') || str_contains($lower, 'server error') || str_contains($lower, 'unauthorized') || str_contains($lower, 'api key') || str_contains($lower, 'bad request')) {
            return 'Service is temporarily experiencing technical difficulties. Your wallet has been refunded. Please try again shortly.';
        }

        // If the error message is clean and short without code/json, use it safely without provider prefix
        if (strlen($this->api_response) <= 80 && !str_contains($this->api_response, '{') && !str_contains($this->api_response, '\\')) {
            return preg_replace('/^[A-Za-z0-9_-]+:\s*/', '', $this->api_response);
        }

        return 'Transaction failed. Your wallet has been refunded. Please try again later.';
    }

}
