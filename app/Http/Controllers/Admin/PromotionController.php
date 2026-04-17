<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PromotionController extends Controller
{
    public function store(Request $request)
    {
        $request->merge([
            'code' => strtoupper(trim((string) $request->input('code'))),
        ]);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('promotions', 'code')],
            'reward_amount' => ['required', 'numeric', 'min:0.01'],
            'max_redemptions' => ['required', 'integer', 'min:1', 'max:1000000'],
            'start_immediately' => ['nullable', 'boolean'],
        ]);

        $startImmediately = (bool) ($validated['start_immediately'] ?? false);

        DB::transaction(function () use ($validated, $startImmediately) {
            if ($startImmediately) {
                Promotion::where('is_active', true)->update([
                    'is_active' => false,
                    'ends_at' => now(),
                ]);
            }

            Promotion::create([
                'code' => $validated['code'],
                'reward_amount' => $validated['reward_amount'],
                'max_redemptions' => $validated['max_redemptions'],
                'redeemed_count' => 0,
                'is_active' => $startImmediately,
                'starts_at' => $startImmediately ? now() : null,
                'ends_at' => null,
                'created_by' => auth()->id(),
            ]);
        });

        return redirect()->back();
    }

    public function activate(Promotion $promotion)
    {
        DB::transaction(function () use ($promotion) {
            Promotion::where('is_active', true)->where('id', '!=', $promotion->id)->update([
                'is_active' => false,
                'ends_at' => now(),
            ]);

            $promotion->update([
                'is_active' => true,
                'starts_at' => $promotion->starts_at ?? now(),
                'ends_at' => null,
            ]);
        });

        return redirect()->back();
    }

    public function deactivate(Promotion $promotion)
    {
        $promotion->update([
            'is_active' => false,
            'ends_at' => $promotion->ends_at ?? now(),
        ]);

        return redirect()->back();
    }

    public function destroy(Promotion $promotion)
    {
        if ($promotion->redeemed_count > 0) {
            return redirect()->back()->withErrors([
                'promotion' => 'Cannot delete a promo that has been redeemed.',
            ]);
        }

        $promotion->delete();

        return redirect()->back();
    }
}
