<?php

namespace App\Http\Resources\Admin;

use App\Models\User;
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
        $fundedByUserId = $metadata['funded_by_user_id'] ?? null;
        $fundedByUser = $fundedByUserId ? User::find($fundedByUserId) : null;

        return [
            'id' => $this->id,
            'reference' => $this->reference_id,
            'reference_id' => $this->reference_id,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'phone' => $this->user->phone_number ?? $this->user->phone ?? null,
                'email' => $this->user->email,
            ] : null,
            'funded_by' => $fundedByUser ? [
                'id' => $fundedByUser->id,
                'name' => $fundedByUser->name,
            ] : null,
            'funded_by_user_id' => $fundedByUserId,
            'amount' => number_format((float) ($this->amount ?? 0), 2),
            'balance_before' => number_format((float) ($this->balance_before ?? 0), 2),
            'balance_after' => number_format((float) ($this->balance_after ?? 0), 2),
            'api_response' => $this->api_response,
            'description' => $this->description,
            'status' => $this->status,
            'type' => $metadata['ledger_type'] ?? 'credit',
            'ledger_type' => $metadata['ledger_type'] ?? null,
            'method' => $metadata['method'] ?? null,
            'payment_gateway' => $metadata['payment_gateway'] ?? null,
            'date' => $this->created_at ? $this->created_at->format('d/m/Y h:i A') : '',
        ];
    }
}
