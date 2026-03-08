<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class DataPlanResource extends JsonResource
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
            'value' => $this->value,
            'network_id' => $this->planType->mobile_network_id,
            'type' => $this->planType->name,
            'amount' => $this->amount,
            'name' => $this->name?? $this->size . ' ' . $this->volume,
            'smart_earner_amount' => $this->smart_earner_amount ?? $this->amount,
            'size' => $this->size,
            'volume' => $this->volume,
            'validity' => $this->validity,
            'enable_custom_vending_api' => $this->enable_custom_vending_api,
            'custom_api_vending_id' => $this->custom_api_vending_id
        ];
    }
}
