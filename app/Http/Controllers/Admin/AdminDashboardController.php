<?php

namespace App\Http\Controllers\Admin;

use App\Actions\GetApiBalance;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Wallet;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AdminDashboardController extends Controller
{
    public function index(Request $request, GetApiBalance $GetApiBalance): Response
    {
        $dateFilter = $request->get('date_filter', 'today');
        $customDate = $request->get('custom_date');

        $dateRange = $this->getDateRange($dateFilter, $customDate);
        $startDate = $dateRange['start'];
        $endDate = $dateRange['end'];

        $apiBalance = $GetApiBalance->handle();

        $stats = $this->getComprehensiveStats($startDate, $endDate);

        $recentTransactions = $this->getRecentTransactions(10);

        $topUsers = $this->getTopUsers(10, $startDate, $endDate);

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => $stats,
            'recent_transactions' => $recentTransactions,
            'top_users' => $topUsers,
            'api_balance' => $apiBalance,
        ]);
    }

    private function getDateRange($filter, $customDate = null)
    {
        $now = Carbon::now();

        switch ($filter) {
            case 'today':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                    'label' => 'Today'
                ];
            case 'yesterday':
                return [
                    'start' => $now->copy()->subDay()->startOfDay(),
                    'end' => $now->copy()->subDay()->endOfDay(),
                    'label' => 'Yesterday'
                ];
            case 'this_week':
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek(),
                    'label' => 'This Week'
                ];
            case 'last_week':
                return [
                    'start' => $now->copy()->subWeek()->startOfWeek(),
                    'end' => $now->copy()->subWeek()->endOfWeek(),
                    'label' => 'Last Week'
                ];
            case 'this_month':
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth(),
                    'label' => 'This Month'
                ];
            case 'last_month':
                return [
                    'start' => $now->copy()->subMonth()->startOfMonth(),
                    'end' => $now->copy()->subMonth()->endOfMonth(),
                    'label' => 'Last Month'
                ];
            case 'custom':
                if ($customDate) {
                    $date = Carbon::parse($customDate);
                    return [
                        'start' => $date->copy()->startOfDay(),
                        'end' => $date->copy()->endOfDay(),
                        'label' => $date->format('M d, Y')
                    ];
                }
                // fallback to today if custom date is not provided
                return $this->getDateRange('today');
            default:
                return $this->getDateRange('today');
        }
    }

    private function getComprehensiveStats($startDate, $endDate)
    {
        // User statistics
        $usersStats = [
            'total' => User::count(),
            'new' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
            'admin' => User::role(['Admin', 'Superadmin', 'Masteradmin'])->count(),
        ];

        // Transaction statistics
        $transactionsQuery = Transaction::whereBetween('created_at', [$startDate, $endDate]);

        $transactionStats = [
            'success' => $transactionsQuery->clone()->where('status', 'SUCCESS')->count(),
            'failed' => $transactionsQuery->clone()->where('status', 'FAILED')->count(),
            'pending' => $transactionsQuery->clone()->where('status', 'PENDING')->count(),
            'success_amount' => $transactionsQuery->clone()->where('status', 'SUCCESS')->sum('amount'),
            'failed_amount' => $transactionsQuery->clone()->where('status', 'FAILED')->sum('amount'),
            'data_transactions' => $transactionsQuery->clone()->where('type', 'DATA')->count(),
        ];

        // Wallet statistics
        $walletStats = [
            'total_balance' => Wallet::sum('balance'),
            'average_balance' => Wallet::avg('balance') ?? 0,
        ];

        // Get transaction breakdown by type with network details
        $transactionBreakdown = $this->getTransactionBreakdown($startDate, $endDate);

        // Get wallet funding stats for the period
        $walletFundingStats = $this->getWalletFundingStats($startDate, $endDate);

        return [
            'users' => $usersStats,
            'transactions' => $transactionStats,
            'wallets' => $walletStats,
            'transaction_breakdown' => $transactionBreakdown,
            'wallet_funding' => $walletFundingStats,
            'date_filter' => [
                'current' => request('date_filter', 'today'),
                'start_date' => $startDate->format('M d, Y'),
                'end_date' => $endDate->format('M d, Y'),
            ],
            // Placeholder for phone numbers and data sharing stats
            'phone_numbers' => [
                'total' => 0,
                'connected' => 0,
                'disconnected' => 0,
            ],
            'data_sharing' => [
                'total_shared' => 0,
                'average_per_number' => 0,
            ],
        ];
    }


    private function getTopUsers($limit, $startDate, $endDate)
    {
        return DB::table('users')
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.username',
                'users.created_at',
                'users.updated_at',
                DB::raw('SUM(CASE WHEN transactions.status = "success" THEN transactions.amount ELSE 0 END) as total_spent'),
                DB::raw('COUNT(CASE WHEN transactions.status = "success" THEN 1 END) as successful_transactions'),
                DB::raw('COUNT(CASE WHEN transactions.status = "failed" THEN 1 END) as failed_transactions')
            )
            ->leftJoin('transactions', 'users.id', '=', 'transactions.user_id')
            ->whereBetween('transactions.created_at', [$startDate, $endDate])
            ->groupBy(
                'users.id',
                'users.name',
                'users.email',
                'users.username',
                'users.created_at',
                'users.updated_at'
            )
            ->orderByDesc('total_spent')
            ->limit($limit)
            ->get();
    }

    private function getTransactionBreakdown($startDate, $endDate)
    {
        $breakdown = [];

        $dataTransactions = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('type', 'DATA')
            ->get()
            ->groupBy(function ($transaction) {
                return ($transaction->metadata['network'] ?? null) ?: ($transaction->provider_name ?? 'Unknown');
            });

        $dataStats = [];
        foreach ($dataTransactions as $networkName => $transactions) {
            $dataStats[$networkName] = [
                'success' => $transactions->where('status', 'SUCCESS')->count(),
                'failed' => $transactions->where('status', 'FAILED')->count(),
                'pending' => $transactions->where('status', 'PENDING')->count(),
                'total_amount' => $transactions->where('status', 'SUCCESS')->sum('amount'),
            ];
        }
        $breakdown['data'] = $dataStats;

        $airtimeTransactions = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('type', 'AIRTIME')
            ->get()
            ->groupBy(function ($transaction) {
                return ($transaction->metadata['network'] ?? null) ?: ($transaction->provider_name ?? 'Unknown');
            });

        $airtimeStats = [];
        foreach ($airtimeTransactions as $networkName => $transactions) {
            $airtimeStats[$networkName] = [
                'success' => $transactions->where('status', 'SUCCESS')->count(),
                'failed' => $transactions->where('status', 'FAILED')->count(),
                'pending' => $transactions->where('status', 'PENDING')->count(),
                'total_amount' => $transactions->where('status', 'SUCCESS')->sum('amount'),
            ];
        }
        $breakdown['airtime'] = $airtimeStats;

        $cableTransactions = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('type', 'CABLE')
            ->get()
            ->groupBy(function ($transaction) {
                return ($transaction->metadata['network'] ?? null) ?: ($transaction->provider_name ?? 'Unknown');
            });

        $cableStats = [];
        foreach ($cableTransactions as $networkName => $transactions) {
            $cableStats[$networkName] = [
                'success' => $transactions->where('status', 'SUCCESS')->count(),
                'failed' => $transactions->where('status', 'FAILED')->count(),
                'pending' => $transactions->where('status', 'PENDING')->count(),
                'total_amount' => $transactions->where('status', 'SUCCESS')->sum('amount'),
            ];
        }
        $breakdown['cable'] = $cableStats;


        $walletTransactions = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('type', 'WALLET')
            ->get()
            ->groupBy(function ($transaction) {
                return $transaction->metadata['payment_gateway'] ?? $transaction->provider_name ?? 'Unknown';
            });

        $walletStats = [];
        foreach ($walletTransactions as $gatewayName => $transactions) {
            $walletStats[$gatewayName] = [
                'success' => $transactions->where('status', 'SUCCESS')->count(),
                'failed' => $transactions->where('status', 'FAILED')->count(),
                'pending' => $transactions->where('status', 'PENDING')->count(),
                'total_amount' => $transactions->where('status', 'SUCCESS')->sum('amount'),
            ];
        }
        $breakdown['wallet'] = $walletStats;

        return $breakdown;
    }

    private function getWalletFundingStats($startDate, $endDate)
    {
        $fundingTransactions = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('type', 'WALLET')
            ->where('metadata->ledger_type', 'credit')
            ->get();

        return [
            'total_funded' => $fundingTransactions->where('status', 'SUCCESS')->sum('amount'),
            'funding_count' => $fundingTransactions->where('status', 'SUCCESS')->count(),
            'unique_users_funded' => $fundingTransactions->where('status', 'SUCCESS')->pluck('user_id')->unique()->count(),
            'average_funding' => $fundingTransactions->where('status', 'SUCCESS')->avg('amount') ?? 0,
        ];
    }

    private function getRecentTransactions($limit = 10)
    {
        return Transaction::with(['user'])
            ->whereNot('type', 'BONUS_WALLET')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($transaction) {
                $metadata = $transaction->metadata ?? [];
                $networkName = $metadata['network'] ?? $transaction->provider_name ?? 'N/A';

                return [
                    'id' => $transaction->id,
                    'reference_id' => $transaction->reference_id,
                    'user' => $transaction->user->name,
                    'description' => $transaction->description ?? 'Transaction',
                    'date' => $transaction->created_at->toISOString(),
                    'status' => $transaction->status,
                    'amount' => $transaction->amount,
                    'network' => $networkName,
                    'api_response' => $transaction->api_response ?? '',
                ];
            });
    }


}
