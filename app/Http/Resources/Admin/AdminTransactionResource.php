<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class AdminTransactionResource extends JsonResource
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
            'amount' => number_format((int)$this->amount, 2),
            'api_response' => $this->api_response,
            'description' => $this->description,
            'status' => $this->status,
            'balance_before' => number_format((int)$this->balance_before, 2),
            'balance_after' => number_format((int)$this->balance_after, 2),
            'type' => $this->type,
            'provider_name' => $this->provider_name,
            'provider_reference' => $this->provider_reference,
            'metadata' => $this->metadata,
            'updatable' => in_array($this->type, ['DATA', 'AIRTIME', 'CABLE', 'ELECTRICITY', 'RESULT_CHECKER']) && $this->status !== 'REFUNDED',
            'date' => $this->created_at->format('d/m/Y h:i A'),
        ];
    }
}
