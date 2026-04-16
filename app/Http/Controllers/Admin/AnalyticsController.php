<?php
namespace App\Http\Controllers\Admin;

use App\Models\User;
use Inertia\Inertia;
use App\Models\UserPackage;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\UserAnalyticsResource;
use App\Models\Transaction;
use Illuminate\Support\Facades\Request as FilterRequest;

class AnalyticsController extends Controller
{
        public function users()
        {
            $pageSize = request('pageSize', 50);
            $currentPage = request('page', 1);

            // Total Wallet Fund Sum and Count
            $totalFund = Transaction::select('user_id', DB::raw('SUM(amount) as total_amount'), DB::raw('COUNT(*) as total_count'))
            ->where('type', 'WALLET')
            ->where('status', 'SUCCESS')
            ->where('metadata->ledger_type', 'credit')
            ->groupBy('user_id');


            // Total Spend Sum
            $totalSpend = Transaction::select('user_id', DB::raw('SUM(amount) as total_amount'), DB::raw('COUNT(*) as total_count'))
            ->where('status', 'SUCCESS')
            ->whereNotIn('type', ['WALLET', 'BONUS_WALLET'])
            ->groupBy('user_id');



            $query = User::select(
                'users.id',
                'users.name',
                'users.phone_number as phone',
                'users.referal_username',
                'users.last_login',
                'users.email',
                // transactions
                'transaction_sum_count.total_amount as total_spending',
                'transaction_sum_count.total_count as transaction_count',
                // funding
                'total_funding.total_amount as total_funding',
                'total_funding.total_count as wallet_funding_count'
            )->with('wallet:id,user_id,balance')
            ->leftJoinSub($totalFund, 'total_funding', function ($join) {
                $join->on('users.id', '=', 'total_funding.user_id');
            })
            ->leftJoinSub($totalSpend, 'transaction_sum_count', function ($join) {
                $join->on('users.id', '=', 'transaction_sum_count.user_id');
            });


            $query->orderBy('total_funding.total_count', 'desc');


            $query->filter(FilterRequest::only('search', 'trashed', 'user_id', 'status','role', 'package'));
            // Paginate the result
            $paginatedData = $query->paginate($pageSize, ['*'], 'page', $currentPage);



            return Inertia::render('Admin/Analytics/Index', [
                'data' => UserAnalyticsResource::collection($paginatedData->appends(FilterRequest::all())),
                'packages' => UserPackage::all(),
            ]);
        }

    public function viewUser(User $user)
    {
        // Total Wallet Fund Sum and Count
        $totalFund = Transaction::select(DB::raw('SUM(amount) as total_amount'), DB::raw('COUNT(*) as total_count'))
            ->where('user_id', $user->id)
            ->where('type', 'WALLET')
            ->where('status', 'SUCCESS')
            ->where('metadata->ledger_type', 'credit')
            ->first();

        // Total Spend Sum
        $totalSpend = Transaction::select(DB::raw('SUM(amount) as total_amount'), DB::raw('COUNT(*) as total_count'))
            ->where('user_id', $user->id)
            ->where('status', 'SUCCESS')
            ->whereNotIn('type', ['WALLET', 'BONUS_WALLET'])
            ->first();

        $user->load('wallet', 'fundingAccounts', 'package');

        // Get transactions
        $transactions = Transaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'amount' => $transaction->amount,
                    'status' => $transaction->status,
                    'reference_id' => $transaction->reference_id,
                    'created_at' => $transaction->created_at,
                ];
            });

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_number' => $user->phone_number,
            'package_name' => $user->package?->name ?? '-',
            'referal_username' => $user->referal_username ?? null,
            'created_at' => $user->created_at,
            'last_login' => $user->last_login,
            'wallet_balance' => $user->wallet?->balance ?? 0,
            'total_spending' => $totalSpend?->total_amount ?? 0,
            'total_fundings' => $totalFund?->total_amount ?? 0,
            'wallet_funding_count' => $totalFund?->total_count ?? 0,
            'transactions_count' => $totalSpend?->total_count ?? 0,
            'kyc_verified_at' => $user->kyc_verified_at,
            'kyc_level' => $user->kyc_level,
            'nin' => $user->nin,
            'bvn' => $user->bvn,
            'api_key' => $user->api_key,
            'funding_accounts' => $user->fundingAccounts->map(function ($account) {
                return [
                    'id' => $account->id,
                    'bank_name' => $account->bank_name,
                    'account_number' => $account->account_number,
                    'reference' => $account->reference,
                ];
            })->toArray(),
            'transactions' => $transactions->toArray(),
        ];

        return Inertia::render('Admin/Analytics/Users/ViewUser', [
            'user' => $userData,
        ]);
    }

    public function index()
    {
        // Top Spenders
        $topSpenders = User::withSum('transactions', 'amount')
            ->orderBy('transactions_sum_amount', 'desc')
            ->take(10)
            ->get();

        // Most Active Users
        $mostActiveUsers = User::withCount('transactions')
            ->orderBy('transactions_count', 'desc')
            ->take(10)
            ->get();

        // High-Value Users
        $highValueUsers = User::select('users.*')
            ->join('transactions', 'users.id', '=', 'transactions.user_id')
            ->selectRaw('AVG(transactions.amount) as avg_amount')
            ->groupBy('users.id')
            ->orderByDesc('avg_amount')
            ->take(10)
            ->get();


        // Retention and Engagement Metrics
        $userRetention = $this->calculateUserRetention();
        $activeUsersDaily = $this->countActiveUsers('daily');
        $activeUsersMonthly = $this->countActiveUsers('monthly');
        $churnRate = $this->calculateChurnRate();

        return Inertia::render('Admin/Analytics/Index', [
            'topSpenders' => $topSpenders,
            'mostActiveUsers' => $mostActiveUsers,
            'highValueUsers' => $highValueUsers,
            'userRetention' => $userRetention,
            'activeUsersDaily' => $activeUsersDaily,
            'activeUsersMonthly' => $activeUsersMonthly,
            'churnRate' => $churnRate,
        ]);
    }

    // Additional Methods for Metrics Calculations

    private function calculateUserRetention()
    {
        $totalUsers = User::count();
        $retainedUsers = User::where('last_login', '>=', now()->subDays(30))->count();
        return ($retainedUsers / $totalUsers) * 100;
    }

    private function countActiveUsers($period)
    {
        if ($period == 'daily') {
            return User::where('last_login', '>=', now()->subDay())->count();
        } elseif ($period == 'monthly') {
            return User::where('last_login', '>=', now()->subMonth())->count();
        }
        return 0;
    }

    private function calculateChurnRate()
    {
        $totalUsers = User::count();
        $churnedUsers = User::where('last_login', '<', now()->subMonth())->count();
        return ($churnedUsers / $totalUsers) * 100;
    }
}
