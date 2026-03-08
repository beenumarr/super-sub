<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Resources\DataTransactionResource;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function dataHistory(Request $request)
    {
        $query = Transaction::with('user');

        // Apply filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('network')) {
            $query->where(function ($q) use ($request) {
                $network = $request->network;
                  $q->whereJsonContains('metadata->network', $network);
            });
        }

        if ($request->filled('dispense_channel')) {
            $query->whereJsonContains('metadata->dispense_channel', $request->dispense_channel);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference_id', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Date filter
        if ($request->filled('date_filter')) {
            $dateFilter = $request->date_filter;
            switch ($dateFilter) {
                case 'today':
                    $query->whereDate('created_at', Carbon::today());
                    break;
                case 'yesterday':
                    $query->whereDate('created_at', Carbon::yesterday());
                    break;
                case 'this_week':
                    $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                    break;
                case 'this_month':
                    $query->whereBetween('created_at', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()]);
                    break;
                case 'last_month':
                    $query->whereBetween('created_at', [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()]);
                    break;
                default:
                    // Default to last 30 days if not matched
                    $query->whereDate('created_at', Carbon::today());
                    break;
            }
        }else{
            $query->whereDate('created_at', Carbon::today());
        }

        // Calculate stats based on filtered query
        $baseQuery = clone $query;


        $stats = $baseQuery->selectRaw('
            count(*) as total_transactions,
            sum(case when status = "SUCCESS" then amount else 0 end) as total_amount,
            sum(case when status = "SUCCESS" then 1 else 0 end) as success_count,
            sum(case when status = "FAILED" then 1 else 0 end) as failed_count,
            sum(case when status = "PENDING" then 1 else 0 end) as pending_count
        ')->first();

        $stats = [
            'total_transactions' => $stats->total_transactions ?? 0,
            'total_amount'       => $stats->total_amount ?? 0,
            'success_count'      => $stats->success_count ?? 0,
            'failed_count'       => $stats->failed_count ?? 0,
            'pending_count'      => $stats->pending_count ?? 0,
        ];


        // Get latest transactions with pagination
        $transactions = $query->latest()->paginate(100);

        // Get available networks from the Network model
        $networks = \App\Models\Network::query()
            ->orderBy('name')
            ->pluck('name')
            ->filter()
            ->unique()
            ->push('Paystack')
            ->sort()
            ->values();

        return Inertia::render('Admin/Transactions/DataTransaction', [
            'transactions' => DataTransactionResource::collection($transactions),
            'networks' => $networks,
            'stats' => $stats,
            'filters' => $request->only(['user_id', 'type', 'status', 'search', 'date_filter', 'network', 'dispense_channel']),
        ]);
    }

    /**
     * Search users for auto-suggest functionality in admin
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchUsers(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:1|max:50'
        ]);

        $query = $request->input('query');

        // Search users who have transactions
        $users = User::whereHas('transactions')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', '%' . $query . '%')
                  ->orWhere('email', 'like', '%' . $query . '%')
                  ->orWhere('phone_number', 'like', '%' . $query . '%');
            })
            ->select('id', 'name', 'email', 'phone_number')
            ->limit(10) // Limit results for performance
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone_number' => $user->phone_number,
                    'label' => $user->name . ' (' . $user->email . ')',
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
}
