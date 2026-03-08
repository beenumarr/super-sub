<?php

namespace App\Http\Resources;

use App\Http\Resources\Admin\DataPlanResource;
use Illuminate\Http\Resources\Json\JsonResource;

class DataPlanTypeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        // Ensure sorting is done in the query if possible
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'mobile_network_id' => $this->mobile_network_id,
            'active' => $this->active,
            'data_plans' => DataPlanResource::collection($this->dataPlans->sortBy(fn ($dataPlan) => $dataPlan->size * [
                'mb' => 1024 * 1024,
                'gb' => 1024 * 1024 * 1024,
            ][$dataPlan->volume]))
        ];
    }
}
