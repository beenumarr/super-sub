<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class WalletTransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $metadata = $this->metadata ?? [];

        return [
            'id' => $this->id,
            'reference_id' => $this->reference_id,
            'user' => $this->user,
            'funded_by_user_id' => $metadata['funded_by_user_id'] ?? null,
            'amount' => number_format((int)$this->amount, 2),
            'balance_before' => number_format((int)$this->balance_before, 2),
            'balance_after' => number_format((int)$this->balance_after, 2),
            'api_response' => $this->api_response,
            'description' => $this->description,
            'status' => $this->status,
            'ledger_type' => $metadata['ledger_type'] ?? null,
            'method' => $metadata['method'] ?? null,
            'payment_gateway' => $metadata['payment_gateway'] ?? null,
            'date' => $this->created_at->format('d/m/Y h:m A'),
        ];
    }
}
