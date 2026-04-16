<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Transaction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ManualFundingRequest;
use App\Http\Resources\Admin\WalletTransactionResource;
use Illuminate\Support\Facades\Request as FilterRequest;

class ManualFundingController extends Controller
{
 

    public function index(): Response
    {
        $pageSize = request('pageSize', 20);
        $currentPage = request('page', 1);
        $from = request('from');
        $to = request('to');
        $type = request('transaction_type');
        $method = request('method');


        $data = Transaction::with('user')
            ->where('type', 'WALLET')
            ->orderBy('updated_at', 'desc');

        if ($from && $to) {
            $data->whereBetween('updated_at', [$from . ' 00:00:00', $to . ' 23:59:59']);
        }

        if ($method && $method === 'monnify') {
            $data->whereNotIn('metadata->method', ['MANUAL_FUNDING_AND_DEBIT', 'WALLET_TRANSFER']);
        } else if ($method && $method === 'manual-funding') {
            $data->where('metadata->method', 'MANUAL_FUNDING_AND_DEBIT');
        } else if ($method && $method === 'wallet-transfer') {
            $data->where('metadata->method', 'WALLET_TRANSFER');
        } else {
            $data->where('metadata->method', 'MANUAL_FUNDING_AND_DEBIT');
        }

        if ($type) {
            $data->where('metadata->ledger_type', $type);
        }


        $data->filter(FilterRequest::only('search', 'trashed', 'user_id', 'status'));


        // Get total amount
        $total = $data->sum('amount');

        return Inertia::render('Admin/WalletFunding/Index', [
            'transactions' => WalletTransactionResource::collection(
                $data->paginate($pageSize, ['*'], 'page', $currentPage)->appends(FilterRequest::all())
            ),
            'total_amount' => number_format($total, 2),
        ]);
    }


    public function store(ManualFundingRequest $request)
    {

        $data = $request->validated();
        $user = User::find($data['user_id']);
        $wallet = $user->wallet;

        $balance_before = $wallet->balance;
        $operation = $data['type'] === 'credit' ? 'increment' : 'decrement';
        $wallet->$operation($data['wallet_type']?? 'balance', $data['amount']);

        $balance_after = $wallet->balance;

        $walletType = $data['wallet_type'] ?? 'balance';

         // Store Transaction Records
        $reference = $this->generateRef();

        Transaction::create([
            'reference_id' => $reference,
            'user_id' => $user->id,
            'type' => 'WALLET',
            'amount' => (float) $data['amount'],
            'status' => 'SUCCESS',
            'provider_name' => 'SYSTEM',
            'provider_reference' => $reference,
            'api_response' => "Manual {$data['type']} {$walletType} {$data['amount']}",
            'description' => "Manual {$data['type']} {$walletType} {$data['amount']}",
            'balance_before' => $balance_before,
            'balance_after' => $balance_after,
            'metadata' => [
                'ledger_type' => $data['type'],
                'method' => 'MANUAL_FUNDING_AND_DEBIT',
                'payment_gateway' => 'admin-manual',
                'wallet_type' => $walletType,
                'funded_by_user_id' => auth()->id(),
            ],
        ]);


        return redirect()->back();


    }


    private function generateRef() {
        $number = 'WT'.now()->month.now()->year.mt_rand(100000, 999999);
        if (Transaction::where('reference_id', $number)->exists()){
            return $this->generateRef();
        }
        return $number;
    }

}
