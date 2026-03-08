<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CableNetworkResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {

        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'active' => $this->active,
            'transaction_api_id' => $this->transaction_api_id,
            'user_charges' => $this->userCharges->only('amount', 'amount_type','type'),
            'service_charges' => TransactionAddonResource::collection($this->addon),
            'plans'=> request('withPlans') ? $this->plans : []
        ];
    }
}
