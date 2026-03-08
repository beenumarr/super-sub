<?php

namespace App\Http\Controllers\Admin;

use App\Actions\GetApiBalance;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\DataTransaction;
use App\Models\AirtimeTransaction;
use App\Models\WalletTransaction;
use App\Models\CableSubscriptionTransaction;
use App\Models\ElectricityBillTransaction;
use App\Models\ResultCheckerTransaction;
use App\Models\MobileNetwork;
use App\Models\CableNetwork;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

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
            'success' => $transactionsQuery->clone()->where('status', 'success')->count(),
            'failed' => $transactionsQuery->clone()->where('status', 'failed')->count(),
            'pending' => $transactionsQuery->clone()->where('status', 'pending')->count(),
            'success_amount' => $transactionsQuery->clone()->where('status', 'success')->sum('amount'),
            'failed_amount' => $transactionsQuery->clone()->where('status', 'failed')->sum('amount'),
            'data_transactions' => $transactionsQuery->clone()->where('transactionable_type', 'App\Models\DataTransaction')->count(),
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
            ->where('transactionable_type', 'App\Models\DataTransaction')
            ->with(['transactionable.network'])
            ->get()
            ->groupBy(function($transaction) {
                return $transaction->transactionable->network->name ?? 'Unknown';
            });

        $dataStats = [];
        foreach ($dataTransactions as $networkName => $transactions) {
            $dataStats[$networkName] = [
                'success' => $transactions->where('status', 'success')->count(),
                'failed' => $transactions->where('status', 'failed')->count(),
                'pending' => $transactions->where('status', 'pending')->count(),
                'total_amount' => $transactions->where('status', 'success')->sum('amount'),
            ];
        }
        $breakdown['data'] = $dataStats;

        $airtimeTransactions = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('transactionable_type', 'App\Models\AirtimeTransaction')
            ->with(['transactionable.network'])
            ->get()
            ->groupBy(function($transaction) {
                return $transaction->transactionable->network->name ?? 'Unknown';
            });

        $airtimeStats = [];
        foreach ($airtimeTransactions as $networkName => $transactions) {
            $airtimeStats[$networkName] = [
                'success' => $transactions->where('status', 'success')->count(),
                'failed' => $transactions->where('status', 'failed')->count(),
                'pending' => $transactions->where('status', 'pending')->count(),
                'total_amount' => $transactions->where('status', 'success')->sum('amount'),
            ];
        }
        $breakdown['airtime'] = $airtimeStats;

        $cableTransactions = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('transactionable_type', 'App\Models\CableSubscriptionTransaction')
            ->with(['transactionable.network'])
            ->get()
            ->groupBy(function($transaction) {
                return $transaction->transactionable->network->name ?? 'Unknown';
            });

        $cableStats = [];
        foreach ($cableTransactions as $networkName => $transactions) {
            $cableStats[$networkName] = [
                'success' => $transactions->where('status', 'success')->count(),
                'failed' => $transactions->where('status', 'failed')->count(),
                'pending' => $transactions->where('status', 'pending')->count(),
                'total_amount' => $transactions->where('status', 'success')->sum('amount'),
            ];
        }
        $breakdown['cable'] = $cableStats;


        $walletTransactions = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('transactionable_type', 'App\Models\WalletTransaction')
            ->with(['transactionable'])
            ->get()
            ->groupBy(function($transaction) {
                return $transaction->transactionable->payment_gateway ?? 'Unknown';
            });

        $walletStats = [];
        foreach ($walletTransactions as $gatewayName => $transactions) {
            $walletStats[$gatewayName] = [
                'success' => $transactions->where('status', 'success')->count(),
                'failed' => $transactions->where('status', 'failed')->count(),
                'pending' => $transactions->where('status', 'pending')->count(),
                'total_amount' => $transactions->where('status', 'success')->sum('amount'),
            ];
        }
        $breakdown['wallet'] = $walletStats;

        return $breakdown;
    }

    private function getWalletFundingStats($startDate, $endDate)
    {
        $fundingTransactions = Transaction::whereBetween('created_at', [$startDate, $endDate])
            ->where('transactionable_type', 'App\Models\WalletTransaction')
            ->with('transactionable')
            ->get();

        return [
            'total_funded' => $fundingTransactions->where('status', 'success')->sum('amount'),
            'funding_count' => $fundingTransactions->where('status', 'success')->count(),
            'unique_users_funded' => $fundingTransactions->where('status', 'success')->pluck('user_id')->unique()->count(),
            'average_funding' => $fundingTransactions->where('status', 'success')->avg('amount') ?? 0,
        ];
    }

    private function getRecentTransactions($limit = 10)
    {
        return Transaction::with(['user', 'transactionable'])
            ->whereNot('transactionable_type', 'App\Models\BonusWalletTransaction')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($transaction) {
                $networkName = 'N/A';

                if ($transaction->transactionable_type === 'App\Models\DataTransaction' && $transaction->transactionable->network) {
                    $networkName = $transaction->transactionable->network->name;
                } elseif ($transaction->transactionable_type === 'App\Models\AirtimeTransaction' && $transaction->transactionable->network) {
                    $networkName = $transaction->transactionable->network->name;
                } elseif ($transaction->transactionable_type === 'App\Models\CableSubscriptionTransaction' && $transaction->transactionable->network) {
                    $networkName = $transaction->transactionable->network->name;
                }

                return [
                    'id' => $transaction->id,
                    'reference_id' => $transaction->reference,
                    'user' => $transaction->user->name,
                    'description' => $transaction->description ?? $transaction->transactionable->description ?? 'Transaction',
                    'date' => $transaction->created_at->toISOString(),
                    'status' => strtoupper($transaction->status),
                    'amount' => $transaction->amount,
                    'network' => $networkName,
                    'api_response' => $transaction->api_response ?? '',
                ];
            });
    }


}
