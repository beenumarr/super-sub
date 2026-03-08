<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WalletController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $recent_transactions = Transaction::where('user_id', $user->id )->where('type', 'WALLET')->latest()
        ->take(5)
        ->get()
        ->map(function ($transaction) {
            return [
                'id' => $transaction->reference_id,
                'description' => $transaction->description,
                'reference_id' => $transaction->reference_id,
                'date' => $transaction->created_at->toISOString(),
                'status' => $transaction->status,
                'amount' => $transaction->amount,
            ];
        });


            return inertia('Wallet/Index', [
                'wallet'=> request()->user()->wallet,
                'fundingAccounts'=> request()->user()->fundingAccounts,
                'publicKey'=> config('services.paystack.public'),
                'transactions'=> $recent_transactions
            ]);

    }
}
