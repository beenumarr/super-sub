<?php

namespace App\Http\Controllers\User;

use App\Actions\Promo\FundBonusWallet;
use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\PromotionRedemption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PromotionRedemptionController extends Controller
{
    public function redeem(Request $request, FundBonusWallet $fundBonusWallet)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        $code = strtoupper(trim($validated['code']));
        $user = $request->user();

        DB::transaction(function () use ($code, $user, $fundBonusWallet) {
            $promotion = Promotion::where('code', $code)->lockForUpdate()->first();

            if (!$promotion || !$promotion->is_active) {
                throw ValidationException::withMessages([
                    'code' => 'Invalid or inactive promo code.',
                ]);
            }

            if ($promotion->starts_at && now()->lt($promotion->starts_at)) {
                throw ValidationException::withMessages([
                    'code' => 'This promo is not active yet.',
                ]);
            }

            if ($promotion->ends_at && now()->gt($promotion->ends_at)) {
                throw ValidationException::withMessages([
                    'code' => 'This promo has ended.',
                ]);
            }

            if ($promotion->redeemed_count >= $promotion->max_redemptions) {
                throw ValidationException::withMessages([
                    'code' => 'This promo has reached its maximum redemptions.',
                ]);
            }

            $alreadyRedeemed = PromotionRedemption::where('promotion_id', $promotion->id)
                ->where('user_id', $user->id)
                ->exists();

            if ($alreadyRedeemed) {
                throw ValidationException::withMessages([
                    'code' => 'You have already redeemed this promo.',
                ]);
            }

            $transaction = $fundBonusWallet->handle(
                ['amount' => (float) $promotion->reward_amount],
                'Promo Reward: '.$promotion->code,
                $user
            );

            PromotionRedemption::create([
                'promotion_id' => $promotion->id,
                'user_id' => $user->id,
                'transaction_id' => $transaction->id,
                'redeemed_at' => now(),
            ]);

            $promotion->increment('redeemed_count');
        });

        return redirect()->back();
    }
}

