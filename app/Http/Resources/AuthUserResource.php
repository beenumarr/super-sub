<?php

namespace App\Http\Resources;

use App\Models\FundingMethod;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthUserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $default_bank_code = config('settings.default_funding_bank') ?? "50515";
        $active = FundingMethod::whereActive(1)->pluck('code');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone'=> $this->phone,
            'email'=> $this->email,
            'address'=> $this->address,
            'kyc_verified'=> $this->kyc_verified_at && true,
            'package'=> $this->package,
            'wallet'=> $this->wallet,
            'funding_accounts'=> $this->fundingAccounts->count() > 0? $this->fundingAccounts()->whereIn('bank_code', $active)->orderByRaw("CASE WHEN bank_code = $default_bank_code THEN 0 ELSE 1 END")->get(): [],
            'date' => $this->created_at->format('d/m/Y h:m A'),
            'notifications'=> config('settings.site_notification')
        ];
    }
}
