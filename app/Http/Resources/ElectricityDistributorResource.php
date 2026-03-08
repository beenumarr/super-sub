<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ElectricityDistributorResource extends JsonResource
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
            'api_id' => $this->api_id,
            'active' => $this->active,
            'user_charges' => $this->userCharges->only('amount', 'amount_type','type'),
            'service_charges' => TransactionAddonResource::collection($this->addon),
        ];
    }
}
