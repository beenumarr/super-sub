<?php

namespace App\Http\Resources\Admin;

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
            'api_plan_id' => $this->api_plan_id,
            'data_plan_type_id' => $this->data_plan_type_id,
            'numeric' => $this->numeric,
            'name' => $this->name?? $this->size . ' ' . $this->volume,
            'active' => $this->active,
            'value' => $this->value,
            'network' => $this->planType->network->name ?? null, // Handle null cases
            'network_id' => $this->planType->mobile_network_id ?? null,
            'plan_type' => $this->planType->name ?? null,
            'amount' => $this->amount,
            'user_amount' => $this->useramount,
            'smart_earner_amount' => $this->smart_earner_amount ?? $this->amount,
            'affiliate_amount' => $this->affiliate_amount ?? $this->amount,
            'top_user_amount' => $this->top_user_amount ?? $this->amount,
            'api_amount' => $this->api_amount ?? $this->amount,
            'plan_size' => $this->size,
            'plan_volume' => $this->volume,
            'plan_validity' => $this->validity,
            'api_ids' => $this->apis,
            'enable_custom_vending_api' => $this->enable_custom_vending_api,
            'custom_api_vending_id' => $this->custom_api_vending_id
        ];
    }
}

