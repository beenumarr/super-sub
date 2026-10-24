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

        $wallet = $this->wallet;
        $balance = (float) ($wallet?->balance ?? 0);
        $bonusBalance = (float) ($wallet?->bonus_balance ?? 0);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone_number,
            'phone_number' => $this->phone_number,
            'username' => $this->username ?? $this->email,
            'email' => $this->email,
            'address' => $this->address,
            'kyc_verified' => (bool) $this->kyc_verified_at,
            'package' => $this->package?->name ?? 'Standard',
            'wallet' => [
                'id' => $wallet?->id,
                'balance' => $balance,
                'actual_balance' => $balance,
                'bonus_balance' => $bonusBalance,
            ],
            'balance' => $balance,
            'wallet_balance' => $balance,
            'bonus_balance' => $bonusBalance,
            'has_pin' => $this->hasTransactionPin(),
            'email_verified' => $this->hasVerifiedEmail(),
            'needs_email_verification' => in_array(config('settings.feat_enable_email_verification'), ['1', 1, 'true', true], true) && !$this->hasVerifiedEmail(),
            'funding_accounts' => $this->fundingAccounts->count() > 0 ? $this->fundingAccounts()->whereIn('bank_code', $active)->orderByRaw("CASE WHEN bank_code = $default_bank_code THEN 0 ELSE 1 END")->get() : [],
            'date' => $this->created_at?->format('d/m/Y h:m A'),
            'notifications' => config('settings.site_notification')
        ];
    }
}
