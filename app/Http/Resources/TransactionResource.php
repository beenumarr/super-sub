<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user' => $this->user->only('id','name','phone'),
            'reference_id' => $this->reference_id,
            'reference' => $this->reference_id,
            'amount' => number_format((int)$this->amount, 2),
            'api_response' => (auth()->check() && (auth()->user()->isAdmin || auth()->user()->hasRole(['Admin', 'Superadmin', 'Masteradmin'])))
                ? $this->api_response
                : $this->user_friendly_response,
            'description' => $this->description,
            'status' => $this->status,
            'balance_before' => number_format((int)$this->balance_before, 2),
            'balance_after' => number_format((int)$this->balance_after, 2),
            'type' => $this->type,
            'provider_name' => $this->provider_name,
            'provider_reference' => $this->provider_reference,
            'metadata' => $this->metadata,
            'token' => $this->metadata['token'] ?? null,
            'transactionable' => [
                'token' => $this->metadata['token'] ?? null,
                'description' => $this->description,
            ],
            'date' => $this->created_at->format('d/m/Y h:i A'),

        ];
    }
}
