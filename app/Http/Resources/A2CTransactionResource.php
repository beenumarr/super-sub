<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class A2CTransactionResource extends JsonResource
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
            'reference' => $this->reference,
            'amount_formatted' => number_format((int)$this->amount, 2),
            'amount' => $this->amount,
            'api_response' => $this->api_response,
            'description' => $this->description,
            'success' => $this->success,
            'network' => $this->network->name,
            'phone_number' => $this->phone_number,
            'status' => $this->status,
            'failed' => $this->failed,
            'quantity' => $this->quantity,
            'date' => $this->created_at->format('d/m/Y h:i A'),
            'user' => $this->when($this->resource->relationLoaded('user'), function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),

        ];
    }
}
