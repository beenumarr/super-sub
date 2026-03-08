<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class UserAnalyticsResource extends JsonResource
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
            'last_login' => $this->last_login,
            'email' => $this->email,
            'phone' => $this->phone,
            'wallet_balance' => $this->wallet->balance,
            'referal_username' => $this->referal_username ?? "N/A",

            //Totals
            'total_spending' =>  number_format((int)$this->total_spending ?? 0, 2),
            'total_fundings' =>  number_format((int)$this->total_funding ?? 0, 2),

            //Counts
            'wallet_funding_count' =>  $this->wallet_funding_count,
            'transactions_count' =>  $this->transaction_count ?? 0,

        ];
    }
}
