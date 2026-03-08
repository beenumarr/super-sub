<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransactionAddonResource extends JsonResource
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
            'package_name' => $this->package->name,
            'amount' => $this->amount,
            'type' => $this->type,
            'amount_type' => $this->amount_type,
            'active' => $this->active, //! check
        ];
    }
}
