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
            'reference' => $this->reference,
            'reference_id' => $this->reference,
            'amount' => number_format((int)$this->amount, 2),
            'api_response' => $this->api_response,
            'description' => $this->description,
            'transactionable' => $this->transactionable,
            'status' => $this->status,
            'balance_before' => number_format((int)$this->balance_before, 2),
            'balance_after' => number_format((int)$this->balance_after, 2),
            'transactionable_id' => $this->transactionable_id,
            'transactionable_type' => $this->transactionable_type,
            'updatable'=> in_array($this->transactionable_type, ['App\\Models\\DataTransaction', 'App\\Models\\AirtimeTransaction', 'App\\Models\\CableSubscriptionTransaction', 'App\\Models\\ElectricityBillTransaction']) && $this->status != 'refunded',
            'date' => $this->created_at->format('d/m/Y h:i A'),
        ];
    }
}
