<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'roles' => $this->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                ];
            })->toArray(),
            'is_active' => (bool) ($this->active ?? false),
            'phone_number' => $this->phone_number ?? $this->phone,
            'phone' => $this->phone,
            'wallet' => [
                'id' => $this->wallet?->id,
                'balance' => $this->wallet?->balance ?? 0,
                'currency' => 'NGN',
            ],
            'category' => $this->whenLoaded('category', function () {
                return $this->category ? [
                    'id' => $this->category->id,
                    'name' => $this->category->name,
                ] : null;
            }),
            'phone_numbers_count' => 0,
            'connected_phone_numbers_count' => 0,
            'disconnected_phone_numbers_count' => 0,
            'transactions_count' => 0,
            'email_verified_at' => $this->email_verified_at,
            'kyc_level' => $this->kyc_level,
            'account_status' => $this->account_status,
            'address' => $this->address,
            'user_package_id' => $this->user_package_id,
            'created_at' => $this->created_at,
            'user_config' => $this->user_config,
        ];
    }
}
