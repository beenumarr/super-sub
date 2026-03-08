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

class AdminTransactionController extends Controller
{
    public function index(): Response
    {
        $pageSize = request('pageSize', 100);
        $currentPage = request('page', 1);
        $from = request('from');
        $to = request('to');
        $type = request('transaction_type');

            $data = Transaction::whereNot('transactionable_type', "App\\Models\\BonusWalletTransaction")->with('user','transactionable');

        if ($from && $to) {
            $data->whereBetween('updated_at', [$from . ' 00:00:00', $to . ' 23:59:59']);
        }

        if ($type) {
            $data->where('transactionable_type', "App\\Models\\" . $type);
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
            'status'=> 'required|in:failed,success,refunded'
        ]);

        if($request->status === 'refunded'){ // validate transactiontype in: Airtime, Data,

            $user = $transaction->user;
            $wallet = $user->wallet;

            $balance_before = $wallet->balance;

            $wallet->increment('balance', $transaction->amount);


            $balance_after = $wallet->balance;

            $newTransaction = $transaction->transactionable_type::create([
                ...collect($transaction->transactionable)
            ]);

              // Store General Transaction
            $newTransaction->transaction()->create([
                    ...collect($transaction),
                'status'=> 'refunded',
                'reference'=> $this->generateRef(),
                'balance_before'=> $balance_before,
                'balance_after'=> $balance_after,
                ]);

                $transaction->update([
                    'status' => 'failed'
                ]);



            // Create transaction for refunded

        }elseif($request->status === 'failed'){ // validate transactiontype in: Airtime, Data,

            $user = $transaction->user;
            $wallet = $user->wallet;

            $balance_before = $wallet->balance;

            // $wallet->increment('balance', $transaction->amount);

            $transaction->update([
                'status' => $request->status,
                'api_response' => "Transaction failed",
            ]);


        }elseif($request->status === 'success') {


            $user = $transaction->user;
            $wallet = $user->wallet;

            $balance_before = $transaction->balance_before;

            $transaction->update([
                'status' => $request->status,
                'api_response' => "Transaction successful",
                'balance_before' => $balance_before,
                'balance_after' =>  (float)$balance_before - (float)$transaction->amount,
            ]);

            $wallet->update(['balance'=>$transaction->balance_after]);

            // $wallet->decrement('balance', $transaction->amount);


        }




        return back();

    }

    private function generateRef() {
        $number = 'TX'.now()->month.now()->year.mt_rand(100000, 999999);
        if (Transaction::wherereference($number)->exists()){
            return $this->generateRef();
        }
        return $number;
    }

}
