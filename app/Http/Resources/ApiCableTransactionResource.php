<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ApiCableTransactionResource extends JsonResource
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
            'network' => $this->transactionable->network->id,
            'ident' => $this->reference,
            'amount' => number_format((int)$this->amount, 2),
            'api_response' => $this->api_response,
            'description' => $this->description,
            'plan_network' => $this->transactionable->network->name,
            'Status' => strtolower((string) $this->status) === 'success' ? 'successful' : $this->status,
            'balance_before' => number_format((int)$this->balance_before, 2),
            'balance_after' => number_format((int)$this->balance_after, 2),
            'create_date' => $this->created_at->format('d/m/Y h:i A'),
        ];
    }
}
