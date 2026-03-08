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

        $this->transactionable->description;

        return [
            'id' => $this->id,
            'user' => $this->user->only('id','name','phone'),
            'reference' => $this->reference,
            'amount' => number_format((int)$this->amount, 2),
            'api_response' => $this->api_response,
            'description' => $this->description,
            'transactionable' => $this->transactionable,
            'status' => $this->status,
            'balance_before' => number_format((int)$this->balance_before, 2),
            'balance_after' => number_format((int)$this->balance_after, 2),
            'transactionable_id' => $this->transactionable_id,
            'transactionable_type' => $this->transactionable_type,
            'date' => $this->created_at->format('d/m/Y h:i A'),

        ];
    }
}
