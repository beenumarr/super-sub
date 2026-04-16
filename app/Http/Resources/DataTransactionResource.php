<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DataTransactionResource extends JsonResource
{
    public function toArray($request): array
    {
        $metadata = $this->metadata ?? [];

        return [
            'id' => $this->id,
            'reference_id' => $this->reference_id,
            'user' => $this->user?->only('id', 'name', 'phone', 'email'),
            'type' => $this->type,
            'status' => $this->status,
            'amount' => (float) $this->amount,
            'description' => $this->description,
            'provider_name' => $this->provider_name,
            'dispense_channel' => $metadata['dispense_channel'] ?? $this->dispense_channel,
            'network' => $metadata['network'] ?? $this->provider_name,
            'beneficiary' => $metadata['beneficiary'] ?? null,
            'plan_name' => $metadata['plan_name'] ?? null,
            'plan_category' => $metadata['plan_category'] ?? null,
            'created_at' => $this->created_at?->toISOString(),
            'metadata' => $metadata,
        ];
    }
}

