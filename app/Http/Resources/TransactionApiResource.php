<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransactionApiResource extends JsonResource
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
            'url' => $this->url,
            'name' => $this->name,
            'token' => $this->token,
            'username' => $this->username,
            'password' => $this->password,
            'model'=> $this->model,
            'mtn_service_id'=> $this->mtn_service_id,
            'airtel_service_id'=> $this->airtel_service_id,
            'glo_service_id'=> $this->glo_service_id,
            'ninemobile_service_id'=> $this->ninemobile_service_id,


        ];
    }
}
