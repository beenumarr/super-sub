<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\AppConfiguration;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $recent_transactions = Transaction::where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->reference_id,
                    'amount' => $transaction->amount,
                    'description' => $transaction->description,
                    'reference_id' => $transaction->reference_id,
                    'date' => $transaction->created_at->toISOString(),
                    'status' => $transaction->status,
                    'telco_price' => $transaction->metadata['telco_price'] ?? 'N/A',
                    'network' => $transaction->metadata['network'] ?? 'Unknown',
                ];
            });



        $announcementEnabled = AppConfiguration::where('key', 'welcome_announcement_enabled')->first()?->value === 'true';
        $announcementTitle = AppConfiguration::where('key', 'welcome_announcement_title')->first()?->value ?? 'Welcome!';
        $announcementContent = AppConfiguration::where('key', 'welcome_announcement_content')->first()?->value ?? '';

        $hasLoginFlag = session('show_welcome_announcement', false);
        $showAnnouncement = $announcementEnabled && $hasLoginFlag;

        if ($showAnnouncement) {
            session()->forget('show_welcome_announcement');
        }

        $wallet = $user->wallet;
        $walletBalance = $wallet->balance ?? 0;
        $outstandingBalance = $user->outstanding_balance ?? 0;
        $netBalance = $walletBalance - $outstandingBalance;

        $fundingAccounts = $user->fundingAccounts()
            ->where('active', 1)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'bank_name' => $a->bank_name,
                'account_name' => $a->account_name,
                'account_number' => $a->account_number,
            ]);

        $isKycEnabled = in_array(config('settings.feat_enable_kyc'), ['1', 1, 'true', true], true)
            || (
                (in_array(config('settings.feat_enable_kyc_bvn'), ['1', 1, 'true', true], true) || in_array(config('settings.feat_enable_kyc_nin'), ['1', 1, 'true', true], true))
                && !in_array(config('settings.feat_enable_kyc'), ['0', 0, 'false', false], true)
            );

        $logo = AppConfiguration::where('key', 'site_logo')->first()?->value;
        $logoUrl = null;
        if ($logo) {
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists("uploads/" . $logo)) {
                $logoUrl = url(\Illuminate\Support\Facades\Storage::url("uploads/" . $logo));
            } else {
                $logoUrl = asset('images/' . $logo);
            }
        } else {
            $logoUrl = asset('images/logo.png');
        }

        $isWalletTransferEnabled = in_array(
            AppConfiguration::where('key', 'feat_enable_wallet_transfer')->first()?->value ?? config('settings.feat_enable_wallet_transfer', '1'),
            ['1', 1, 'true', true],
            false
        );
        $isReferralEnabled = in_array(
            AppConfiguration::where('key', 'feat_enable_referral')->first()?->value ?? config('settings.feat_enable_referral', '1'),
            ['1', 1, 'true', true],
            false
        );

        $appConfig = [
            'site_name' => AppConfiguration::where('key', 'site_name')->first()?->value ?? config('settings.site_name', config('app.name', 'SuperSub')),
            'site_primary_color' => AppConfiguration::where('key', 'site_primary_color')->first()?->value ?? config('settings.site_primary_color', '#9483EF'),
            'site_secondary_color' => AppConfiguration::where('key', 'site_secondary_color')->first()?->value ?? config('settings.site_secondary_color', '#8B5CF6'),
            'site_logo' => $logoUrl,
            'enable_wallet_transfer' => (bool) $isWalletTransferEnabled,
            'enable_referral' => (bool) $isReferralEnabled,
        ];

        $payload = [
            'recent_transactions' => $recent_transactions,
            'wallet' => [
                'balance' => $netBalance,
                'actual_balance' => $walletBalance,
                'outstanding_balance' => $outstandingBalance,
                'today_usage_fee' => $user->today_usage_fee ?? 0,
                'bonus_balance' => $wallet->bonus_balance ?? 0,
            ],
            'funding_accounts' => $fundingAccounts,
            'welcome_announcement' => [
                'enabled' => $announcementEnabled,
                'show' => $showAnnouncement,
                'title' => $announcementTitle,
                'content' => $announcementContent,
            ],
            'has_pin' => $user->hasTransactionPin(),
            'kyc_enabled' => (bool) $isKycEnabled,
            'enable_wallet_transfer' => (bool) $isWalletTransferEnabled,
            'enable_referral' => (bool) $isReferralEnabled,
            'app_config' => $appConfig,
        ];

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'status' => 'success',
                'data' => $payload,
                ...$payload,
            ]);
        }

        return inertia('Dashboard/Index', $payload);
    }
}
