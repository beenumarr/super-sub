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
                    'description' => $transaction->description,
                    'reference_id' => $transaction->reference_id,
                    'date' => $transaction->created_at->toISOString(),
                    'status' => $transaction->status,
                    'telco_price' => $transaction->metadata['telco_price'] ?? 'N/A',
                    'network' => $transaction->metadata['network'] ?? 'Unknown',
                    'api_response' => $transaction->api_response ?? 'N/A',
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

        return inertia('Dashboard/Index', [
            'recent_transactions' => $recent_transactions,
            'wallet' => [
                'balance' => $netBalance,
                'actual_balance' => $walletBalance,
                'outstanding_balance' => $outstandingBalance,
                'today_usage_fee' => $user->today_usage_fee ?? 0,
                'bonus_balance' => 0,
            ],
            'funding_accounts' => $fundingAccounts,
            'welcome_announcement' => [
                'enabled' => $announcementEnabled,
                'show' => $showAnnouncement,
                'title' => $announcementTitle,
                'content' => $announcementContent,
            ],
            'has_pin' => $user->hasTransactionPin(),
        ]);
    }
}
