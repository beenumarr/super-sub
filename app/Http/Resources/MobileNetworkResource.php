<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MobileNetworkResource extends JsonResource
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
            'default_plan' => $this->dataPlantypes()->first()->id, //! check
            'code' => $this->code,
            'api_network_id' => $this->api_network_id,
            'data_active' => $this->data_active ? 1 : 0,
            'airtime_active' => $this->airtime_active ? 1 : 0,
            'transaction_api_id' => $this->transaction_api_id ,
            'user_discount' => $this->userDiscount ?? 0.0,
            'service_discounts' => TransactionAddonResource::collection($this->addon),
            'plan_types'=> $this->dataPlanTypes,
            'airtime_transaction_api_id'=> $this->airtime_transaction_api_id,
            'plan_type_list'=> $this->dataPlanTypes->pluck('active', 'name')->toArray(),
            'plan_type_api_list'=> $this->dataPlanTypes->pluck('transaction_api_id', 'name')->toArray(),


            'airtime_to_cash_active' => $this->airtime_to_cash_active,
            'airtime_to_cash_api_id' => $this->airtime_to_cash_api_id,
            'a2c_conversion_rate' => $this->a2c_conversion_rate,
            'a2c_auto_method_enabled' => $this->a2c_auto_method_enabled,
            'a2c_manual_method_enabled' => $this->a2c_manual_method_enabled,
        ];
    }
}
