<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Http\Resources\TransactionResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request as FilterRequest;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $pageSize = request('pageSize', 100);
        $currentPage = request('page', 1);
        $from = request('from');
        $to = request('to');
        $type = request('transaction_type');


        if(isset($from)){


            $data = Transaction::where('user_id', auth()->user()->id)->whereBetween('updated_at', [$from.' 00:00:00',$to.' 23:59:59'])->orderBy('created_at', 'desc');

        }else{

             $data = Transaction::where('user_id', auth()->user()->id)->latest()->orderBy('created_at', 'desc');

        }


        if ($type) {
            $modelType = str_contains($type, '\\') ? $type : "App\\Models\\{$type}";
            $data->where('transactionable_type', $modelType);
        }


        $data->filter(FilterRequest::only('search', 'trashed', 'user_id', 'status'));

        $transaction = TransactionResource::collection($data->paginate($pageSize, ['*'], 'page', $currentPage)->appends(FilterRequest::all()));


        if($request->wantsJson() ){

            return response($transaction);

        }


        return Inertia::render('Transactions/Index', [
            'transactions' => $transaction

        ]);
    }



    public function data(ShareDataRequest $request, SMEDirect $sMEDirect) {



        //
        $sMEDirect->handle($sim, $data['phone'], $plan, $transaction);


        return response(json_encode(new APITransactionResource($transaction)));


    }

    public function show(Transaction $transaction)
    {
        return new TransactionResource($transaction);
    }

    /**
     * Get transaction status and details by reference ID.
     */
    public function getByReference(Request $request)
    {
        $request->validate([
            'reference_id' => ['required', 'string'],
        ]);

        $transaction = Transaction::where('reference', $request->reference_id)
            ->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found',
                'data' => null,
            ], 404);
        }

        // Check if user owns this transaction (optional security check)
        if (Auth::check() && $transaction->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to transaction',
                'data' => null,
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaction retrieved successfully',
            'data' => new TransactionResource($transaction),
        ], 200);
    }

    /**
     * Get transaction status by reference ID (public endpoint for webhooks/callbacks).
     */
    public function status(string $referenceId)
    {
        $transaction = Transaction::where('reference', $referenceId)
            ->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found',
                'reference_id' => $referenceId,
                'status' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaction status retrieved successfully',
            'data' => [
                'reference_id' => $transaction->reference,
                'status' => $transaction->status,
                'type' => class_basename($transaction->transactionable_type),
                'amount' => $transaction->amount,
                'description' => $transaction->description,
                'provider_name' => $transaction->provider_name,
                'api_response' => $transaction->api_response,
                'created_at' => $transaction->created_at,
                'updated_at' => $transaction->updated_at,
                'metadata' => $transaction->metadata,
            ],
        ], 200);
    }
}
