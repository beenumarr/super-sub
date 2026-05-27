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
            'token' => $this->token ? maskSensitiveData($this->token) : null,
            'secret_key' => $this->secret_key ? maskSensitiveData($this->secret_key) : null,
            'public_key' => $this->public_key ? maskSensitiveData($this->public_key) : null,
            'username' => $this->username ? maskSensitiveData($this->username) : null,
            'password' => $this->password ? maskSensitiveData($this->password) : null,
            'model' => $this->model,
            'mtn_service_id' => $this->mtn_service_id,
            'airtel_service_id' => $this->airtel_service_id,
            'glo_service_id' => $this->glo_service_id,
            'ninemobile_service_id' => $this->ninemobile_service_id,


        ];
    }
}
