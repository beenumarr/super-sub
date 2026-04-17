<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class DataPlanTypeResource extends JsonResource
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
            'network' => $this->network?->name,
            'network_id' => $this->mobile_network_id,
            'mobile_network_id' => $this->mobile_network_id,
            'name' => $this->name,
            'code' => $this->code,
            'transaction_api_id' => $this->transaction_api_id,
            'active' => $this->active,
        ];
    }
}
