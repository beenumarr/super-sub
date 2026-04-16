<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\AirtimeToCashTransaction;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\A2CTransactionResource;
use App\Http\Resources\Admin\AdminTransactionResource;
use Illuminate\Support\Facades\Request as FilterRequest;
use Illuminate\Support\Str;

class AdminTransactionController extends Controller
{
    public function index(): Response
    {
        $pageSize = request('pageSize', 100);
        $currentPage = request('page', 1);
        $from = request('from');
        $to = request('to');
        $type = request('transaction_type');

        $data = Transaction::whereNot('type', 'BONUS_WALLET')->with('user');

        if ($from && $to) {
            $data->whereBetween('updated_at', [$from . ' 00:00:00', $to . ' 23:59:59']);
        }

        if ($type) {
            $normalized = Str::upper($type);
            $legacyModel = str_contains($type, '\\') ? class_basename($type) : $type;

            $mapped = [
                'DATATRANSACTION' => 'DATA',
                'AIRTIMETRANSACTION' => 'AIRTIME',
                'CABLESUBSCRIPTIONTRANSACTION' => 'CABLE',
                'ELECTRICITYBILLTRANSACTION' => 'ELECTRICITY',
                'ELECTRICITYTRANSACTION' => 'ELECTRICITY',
                'RESULTCHECKERTRANSACTION' => 'RESULT_CHECKER',
                'WALLETTRANSACTION' => 'WALLET',
                'BONUSWALLETTRANSACTION' => 'BONUS_WALLET',
            ][Str::upper($legacyModel)] ?? null;

            $data->where('type', $mapped ?: $normalized);
        }

        if (!auth()->user()->isAdmin) {
            $data->where('user_id', auth()->user()->id);
        }

        // Apply filters
        $data->filter(FilterRequest::only('search', 'trashed', 'user_id', 'status'));

        // Get total amount
        $total = $data->sum('amount');

        // Apply pagination and return data
        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => AdminTransactionResource::collection(
                $data->latest()->paginate($pageSize, ['*'], 'page', $currentPage)
            ),
            'total_amount' => number_format($total, 2),
        ]);
    }


    public function show(Transaction $transaction)
    {
        return new AdminTransactionResource($transaction);
    }


    public function update(Request $request, Transaction $transaction)
    {

        $request->validate([
            'status' => 'required|in:FAILED,SUCCESS,REFUNDED'
        ]);

        if ($request->status === 'REFUNDED') {
            $user = $transaction->user;
            $wallet = $user->wallet;

            $balanceBefore = (float) ($wallet->balance ?? 0);
            $wallet->increment('balance', (float) $transaction->amount);
            $balanceAfter = (float) $wallet->fresh()->balance;

            Transaction::create([
                'reference_id' => $this->generateRef(),
                'user_id' => $user->id,
                'type' => 'WALLET',
                'amount' => (float) $transaction->amount,
                'status' => 'SUCCESS',
                'description' => "Refund for {$transaction->reference_id}",
                'provider_name' => 'SYSTEM',
                'provider_reference' => $transaction->reference_id,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'metadata' => [
                    'ledger_type' => 'credit',
                    'refunded_reference_id' => $transaction->reference_id,
                ],
            ]);

            $transaction->update([
                'status' => 'REFUNDED',
                'api_response' => 'Refunded manually',
            ]);
        } else {
            $transaction->update([
                'status' => $request->status,
                'api_response' => $request->status === 'SUCCESS'
                    ? 'Transaction successful (manual override)'
                    : 'Transaction failed (manual override)',
            ]);
        }




        return back();

    }

    private function generateRef() {
        $number = 'TX'.now()->month.now()->year.mt_rand(100000, 999999);
        if (Transaction::where('reference_id', $number)->exists()){
            return $this->generateRef();
        }
        return $number;
    }

}
