<?php

namespace App\Http\Controllers\Admin;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Wallet;
use App\Jobs\DisburseFund;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\AirtimeToCashTransaction;
use App\Utils\Transaction\TransactionHelper;
use App\Http\Resources\A2CTransactionResource;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Request as FilterRequest;

class A2CTransactionController extends Controller
{

    protected $helpers;
    public function __construct()
    {
        $this->helpers = new  TransactionHelper();
    }

    public function index(): Response
    {
        $pageSize = request('pageSize', 20);
        $currentPage = request('page', 1);
        $from = request('from');
        $to = request('to');

        $data = AirtimeToCashTransaction::with('user','network');

        if ($from && $to) {
            $data->whereBetween('updated_at', [$from . ' 00:00:00', $to . ' 23:59:59']);
        }

        // Apply filters
        $data->filter(FilterRequest::only('search', 'trashed', 'user_id', 'status'));

        // Get total amount
        $total = $data->sum('amount');

        // Apply pagination and return data
        return Inertia::render('Admin/A2CTransactions/Index', [
            'transactions' => A2CTransactionResource::collection(
                $data->latest()->paginate($pageSize, ['*'], 'page', $currentPage)
            ),
            'total_amount' => number_format($total, 2),
        ]);
    }


    public function show(AirtimeToCashTransaction $transaction)
    {
        return new A2CTransactionResource($transaction);
    }


    public function update(Request $request, AirtimeToCashTransaction $transaction)
    {

        $request->validate([
            'status'=> 'required|in:processing,completed,failed,transferred'
        ]);



        $transaction->update([
                'status' => $request->status
        ]);


        if($transaction->status === 'transferred') {
            throw ValidationException::withMessages([
                'status' => 'Transaction already completed.'
            ]);
        }

        if($request->status === 'completed') {

            $user = $transaction->user;
            $wallet = Wallet::lockForUpdate()->where('user_id', $user->id)->firstOrFail();
            $balance_before = $wallet->a2c_balance;

            DB::beginTransaction();
            $wallet->increment('a2c_balance', $transaction->converted_amount);
            $balance_after = $wallet->a2c_balance;

            Log::info('Airtime to Cash Transfer: ', [
                'user_id' => $user->id,
                'wallet_id' => $wallet->id,
                'amount' => $transaction->converted_amount,
                'balance_before' => $balance_before,
                'balance_after' => $balance_after,
            ]);

            DB::commit();

            $transaction->update([
                'status' => 'transferred',
            ]);

        }


        return response()->json([
            'message' => 'Status updated successfully',
            'transaction' => $transaction
        ]);

    }

    public function transferToWallet(Request $request, AirtimeToCashTransaction $transaction)
    {

        if($transaction->status !== 'completed') {
            return response()->json([
                'message' => 'Transaction is not completed',
                'status' => 'error',
            ], 422);
        }

        if($request->wallet_type === 'account-balance') {
            $this->disburseFundToWallet($transaction);
        }

        if($request->wallet_type === 'wallet-balance') {
            $this->disburseFundToWallet($transaction);
        }

        return response()->json([
            'message' => 'Transaction transferred to wallet successfully',
            'status' => 'success',
        ]);


    }


    public function disburseFundToWallet(AirtimeToCashTransaction $transaction)
    {

        $user = $transaction->user;
        $wallet = $user->wallet;
        $balance_before = $wallet->balance;

        DB::beginTransaction();
        $wallet->increment('balance', $transaction->amount);
        $balance_after = $wallet->balance;
        $reference = $this->helpers->generateTransactionRef('ATC');

        Transaction::create([
            'reference_id' => $reference,
            'user_id' => $user->id,
            'type' => 'WALLET',
            'amount' => (float) $transaction->amount,
            'status' => 'SUCCESS',
            'provider_name' => 'SYSTEM',
            'provider_reference' => $reference,
            'description' => "Airtime to Cash {$transaction->phone_number} {$transaction->network->name} {$transaction->amount} {$transaction->reference}",
            'api_response' => 'Airtime to Cash',
            'balance_before' => $balance_before,
            'balance_after' => $balance_after,
            'metadata' => [
                'ledger_type' => 'credit',
                'method' => 'AIRTIME_TO_CASH',
                'payment_gateway' => 'auto-pilot',
                'source_reference' => $transaction->reference,
            ],
        ]);

        DB::commit();

        $transaction->update([
            'status' => 'transferred',
        ]);

        return response()->json([
            'message' => 'Transaction transferred to wallet successfully',
            'status' => 'success',
        ]);

    }


    public function disburseFund(AirtimeToCashTransaction $transaction)
    {
        try {

            // Validate user has bank details
            $user = $transaction->user;
            if (!$user->bank_code || !$user->account_number || !$user->account_name) {
                return response()->json([
                    'message' => 'User has not provided bank details',
                    'status' => 'error',
                ], 422);
            }

            // Generate unique reference
            $reference = $this->helpers->generateTransactionRef('DSC');

            // Dispatch disbursement job
            DisburseFund::dispatch($user, $transaction->amount, $reference);

            // Update transaction status
            $transaction->update([
                'status' => 'processing',
                'disbursement_reference' => $reference
            ]);

            return response()->json([
                'message' => 'Fund disbursement initiated successfully',
                'status' => 'success',
                'reference' => $reference
            ]);

        } catch (Exception $e) {
            Log::error("Error initiating disbursement: " . $e->getMessage());

            return response()->json([
                'message' => 'Failed to initiate disbursement',
                'status' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }




}
