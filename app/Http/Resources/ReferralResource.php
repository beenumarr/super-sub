<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralResource extends JsonResource
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
            'user' => $this->user,
            'date' => $this->created_at->format('d/m/Y h:i A'),
            'bonus_earn' => $this->bonus_earn,
            'claimed' => $this->claimed,
            'valid' => $this->isValid,
            'fund_wallet' => $this->userFundedWallet,
            'email_verified' => $this->user->email_verified_at || true,
            'made_transactions' => $this->userMadeTransactions,
        ];
    }
}
