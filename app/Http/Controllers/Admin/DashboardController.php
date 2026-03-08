<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Date filtering
        $dateFilter = $request->input('date_filter', 'today');
        $customDate = $request->input('custom_date');

        $startDate = null;
        $endDate = null;

        switch ($dateFilter) {
            case 'today':
                $startDate = Carbon::today();
                $endDate = Carbon::today()->endOfDay();
                break;
            case 'yesterday':
                $startDate = Carbon::yesterday();
                $endDate = Carbon::yesterday()->endOfDay();
                break;
            case 'this_week':
                $startDate = Carbon::now()->startOfWeek();
                $endDate = Carbon::now()->endOfWeek();
                break;
            case 'this_month':
                $startDate = Carbon::now()->startOfMonth();
                $endDate = Carbon::now()->endOfMonth();
                break;
            case 'custom':
                if ($customDate) {
                    $startDate = Carbon::parse($customDate);
                    $endDate = Carbon::parse($customDate)->endOfDay();
                } else {
                    $startDate = Carbon::today();
                    $endDate = Carbon::today()->endOfDay();
                }
                break;
            default:
                $startDate = Carbon::today();
                $endDate = Carbon::today()->endOfDay();
        }

        // User stats using single query with aliases
        $userStats = User::selectRaw('
            COUNT(*) as totalUsers,
            SUM(CASE WHEN role = "admin" THEN 1 ELSE 0 END) as adminUsers,
            SUM(CASE WHEN created_at BETWEEN ? AND ? THEN 1 ELSE 0 END) as newUsers
        ', [$startDate, $endDate])->first();
        $totalUsers = $userStats->totalUsers ?? 0;
        $adminUsers = $userStats->adminUsers ?? 0;
        $newUsers = $userStats->newUsers ?? 0;

        // Transaction stats using single query
        $transactionStats = Transaction::selectRaw('
            SUM(CASE WHEN status = "SUCCESS" THEN 1 ELSE 0 END) as totalSuccessTransactions,
            SUM(CASE WHEN status = "FAILED" THEN 1 ELSE 0 END) as totalFailedTransactions,
            SUM(CASE WHEN status = "SUCCESS" THEN amount ELSE 0 END) as totalSuccessAmount,
            SUM(CASE WHEN status = "FAILED" THEN amount ELSE 0 END) as totalFailedAmount
        ')
        ->where('type', 'DATA')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->first();

        $totalSuccessTransactions = $transactionStats->totalSuccessTransactions ?? 0;
        $totalFailedTransactions = $transactionStats->totalFailedTransactions ?? 0;
        $totalSuccessAmount = $transactionStats->totalSuccessAmount ?? 0;
        $totalFailedAmount = $transactionStats->totalFailedAmount ?? 0;

        // Wallet stats
        $totalWalletBalance = Wallet::sum('balance');
        $averageWalletBalance = $totalUsers > 0
            ? $totalWalletBalance / $totalUsers
            : 0;

        // Transaction types
        $dataTransactions = Transaction::where('type', 'DATA')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // Get recent transactions
        $recentTransactions = Transaction::with('user')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'reference_id' => $transaction->reference_id,
                    'user' => $transaction->user ? $transaction->user->name : 'Unknown',
                    'description' => $transaction->description,
                    'date' => $transaction->created_at->toISOString(),
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'network' => $transaction->metadata['network'] ?? 'Unknown',
                    'api_response' => $transaction->api_response ?? 'N/A',
                ];
            });

        // Get top users by transaction amount
        $topUsers = User::withSum(['transactions' => function ($query) use ($startDate, $endDate) {
                $query->where('type', 'DATA')->where('status', 'SUCCESS')
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }], 'amount')
            ->withCount(['transactions as successful_transactions' => function ($query) use ($startDate, $endDate) {
                $query->where('type', 'DATA')->where('status', 'SUCCESS')
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->withCount(['transactions as failed_transactions' => function ($query) use ($startDate, $endDate) {
                $query->where('type', 'DATA')->where('status', 'FAILED')
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->orderByDesc('transactions_sum_amount')
            ->take(15)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'total_spent' => $user->transactions_sum_amount ?? 0,
                    'successful_transactions' => $user->successful_transactions ?? 0,
                    'failed_transactions' => $user->failed_transactions ?? 0,
                ];
            });

        // Network stats for all transactions
        $networkStats = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->whereNot('type', 'WALLET')
            ->selectRaw('
                CASE
                    WHEN provider_name LIKE "%MTN%" THEN "MTN"
                    WHEN provider_name LIKE "%AIRTEL%" THEN "Airtel"
                    WHEN provider_name LIKE "%GLO%" THEN "Glo"
                    WHEN provider_name LIKE "%9MOBILE%" THEN "9mobile"
                    ELSE "Other"
                END as network_name,
                COUNT(*) as total_transactions,
                SUM(CASE WHEN status = "SUCCESS" THEN 1 ELSE 0 END) as successful_transactions,
                SUM(CASE WHEN status = "FAILED" THEN 1 ELSE 0 END) as failed_transactions,
                SUM(CASE WHEN status = "PENDING" THEN 1 ELSE 0 END) as pending_transactions,
                SUM(CASE WHEN status = "SUCCESS" THEN amount ELSE 0 END) as successful_amount,
                SUM(CASE WHEN status = "FAILED" THEN amount ELSE 0 END) as failed_amount,
                SUM(CASE WHEN status = "PENDING" THEN amount ELSE 0 END) as pending_amount
            ')
            ->groupBy('network_name')
            ->get()
            ->map(function ($item) {
                return [
                    'network' => $item->network_name,
                    'total_transactions' => $item->total_transactions ?? 0,
                    'successful_transactions' => $item->successful_transactions ?? 0,
                    'failed_transactions' => $item->failed_transactions ?? 0,
                    'pending_transactions' => $item->pending_transactions ?? 0,
                    'successful_amount' => $item->successful_amount ?? 0,
                    'failed_amount' => $item->failed_amount ?? 0,
                    'pending_amount' => $item->pending_amount ?? 0,
                    'success_rate' => $item->total_transactions > 0
                        ? round(($item->successful_transactions / $item->total_transactions) * 100, 1)
                        : 0,
                ];
            });

        // Prepare stats array
        $stats = [
            'users' => [
                'total' => $totalUsers,
                'new' => $newUsers,
                'admin' => $adminUsers,
            ],
            'transactions' => [
                'success' => $totalSuccessTransactions,
                'failed' => $totalFailedTransactions,
                'success_amount' => $totalSuccessAmount,
                'failed_amount' => $totalFailedAmount,
                'data_transactions' => $dataTransactions,
            ],
            'wallets' => [
                'total_balance' => $totalWalletBalance,
                'average_balance' => $averageWalletBalance,
            ],
            'date_filter' => [
                'current' => $dateFilter,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
            'network_stats' => $networkStats,
        ];

        return inertia('Admin/Dashboard/Index', [
            'stats' => $stats,
            'recent_transactions' => $recentTransactions,
            'top_users' => $topUsers,
            'user_role' => $request->user()->role,
        ]);
    }
}
