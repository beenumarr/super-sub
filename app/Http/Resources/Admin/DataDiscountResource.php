<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DataDiscountResource extends JsonResource
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
            'api_network_id' => $this->api_network_id,
            'data_active' => $this->data_active,
            'airtime_active' => $this->airtime_active,
            'plan_types'=> $this->dataPlanTypes,
        ];
    }
}
