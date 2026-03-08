<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Transaction;
use App\Models\WalletTransaction;
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


        $data = WalletTransaction::with('transaction','user')->orderBy('updated_at', 'desc');

        if ($from && $to) {
            $data->whereBetween('updated_at', [$from . ' 00:00:00', $to . ' 23:59:59']);
        }

        if($method && $method === 'monnify'){
            $data->whereNotIn('method', ['MANUAL_FUNDING_AND_DEBIT', 'WALLET_TRANSFER']);
        }else if($method && $method === 'manual-funding'){
            $data->where('method', 'MANUAL_FUNDING_AND_DEBIT');

        }else if($method && $method === 'wallet-transfer'){
            $data->where('method', 'WALLET_TRANSFER');

        }else{
            $data->where('method', 'MANUAL_FUNDING_AND_DEBIT');

        }

        if($type){
            $data->where('type', $type);
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


         // Store Transaction Records
        $transactionable = WalletTransaction::create([
            'user_id' => auth()->user()->id,
            'wallet_id' => $user->wallet->id,
            'amount' => $data['type'] === 'debit'? - $data['amount'] : $data['amount'],
            'type'=> $data['type'],
            'method'=> 'MANUAL_FUNDING_AND_DEBIT',
            'payment_gateway'=> 'admin-manual'

        ]);

        // Store General Transaction
        $transactionable->transaction()->create([
            'reference'=> $this->generateRef(),
            'user_id' => $user->id,
            'amount' => $data['type'] === 'debit'? - $data['amount'] : $data['amount'],
            'status' => 'success',
            'api_response'=> "Manual Funding / Debit ". $data['wallet_type']?? 'Balance' . " " . $data['amount'],
            'description'=> "Manual Funding / Debit ". $data['wallet_type']?? "Balance" . " " . $data['amount'],
            'balance_before'=> $balance_before,
            'balance_after'=> $balance_after,
        ]);


        return redirect()->back();


    }


    private function generateRef() {
        $number = 'WT'.now()->month.now()->year.mt_rand(100000, 999999);
        if (Transaction::wherereference($number)->exists()){
            return $this->generateRef();
        }
        return $number;
    }

}
