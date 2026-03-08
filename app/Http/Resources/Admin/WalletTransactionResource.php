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
        return [
            'id' => $this->id,
            'reference' => $this->transaction->reference,
            'user' => $this->transaction->user,
            'funded_by' => $this->user->only('id','name'),
            'amount' => number_format((int)$this->amount, 2),
            'balance_before' => number_format((int)$this->transaction->balance_before, 2),
            'balance_after' => number_format((int)$this->transaction->balance_after, 2),
            'api_response' => $this->transaction->api_response,
            'description' => $this->transaction->description,
            'status' => $this->transaction->status,
            'type' => $this->type,
            'date' => $this->created_at->format('d/m/Y h:m A'),
        ];
    }
}
