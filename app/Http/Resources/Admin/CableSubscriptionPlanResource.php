<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class CableSubscriptionPlanResource extends JsonResource
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
            'cable_name'=> $this->cableProvider->name,
            'cable_network_id' => $this->cable_network_id,
            'product_code'=> $this->product_code,
            'package_name' => $this->package_name,
            'validity' => $this->validity,
            'amount' => $this->amount,
            'active'=> $this->active,
            'api_ids'=> $this->apis,
        ];
    }
}
