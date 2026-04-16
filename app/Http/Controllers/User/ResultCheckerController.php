<?php

namespace App\Http\Controllers\User;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\ExamType;
use Illuminate\Http\Request;
use App\Actions\BuyResultChecker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Resources\ExamResource;
use App\Models\ResultCheckerTransaction;
use App\Models\Transaction;
use App\Utils\Transaction\TransactionHelper;
use App\Http\Resources\ApiTransactionResource;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\TransactionDetailResource;
use App\Http\Requests\Transaction\CheckResultRequest;

class ResultCheckerController extends Controller
{
    protected $helpers;
    protected $buyResultChecker;

    public function __construct(TransactionHelper $helpers, BuyResultChecker $buyResultChecker)
    {
        $this->helpers = $helpers;
        $this->buyResultChecker = $buyResultChecker;
    }

    public function index(): Response
    {
        return Inertia::render('ResultChecker/Index', [
            'exam_types' => ExamResource::collection(ExamType::all()),
            ]);
    }

    public function store(CheckResultRequest $request)
    {
        $data = $request->validated();
        $user = $request->user();

        $transaction = $this->performTransaction($request, $user, $data);

        $status = $this->buyResultChecker->handle($transaction);

       if($status !== 'SUCCESS'){

           $error = $transaction->api_response;

           throw ValidationException::withMessages([
                'status' => $error ?? 'Something Went Wrong! Try again Letter',
            ]);
        }


        if ($request->wantsJson()) {
            return response(new TransactionDetailResource($transaction, withTransactionable: false));
        }

        return back();
    }



    function storeApi(Request $request) {

        $data =  $request->validate([
            'exam_name'=> 'required|exists:exam_types,name',
            'quantity'=> 'required|numeric|max:5'
        ]);


        $user = $request->user();

        $examType = ExamType::where('name', $data['exam_name'])->first();

        $data['exam_type_id'] = $examType->id;


        $transaction = $this->performTransaction($request, $user, $data);

        $status = $this->buyResultChecker->handle($transaction);


        if($status !== 'SUCCESS'){
                $error = $transaction->api_response;

                throw ValidationException::withMessages([
                    'status' => $error ?? 'Something Went Wrong! Try again Letter',
                ]);
            }

        return response(new ApiTransactionResource($transaction));

    }

    function performTransaction(Request $request, $user, $data) {

        // $this->helpers->checkServiceActive($user, $data['exam_type'], 'result_checker');

        $examType = ExamType::find($data['exam_type_id']);

        $amount = $examType->amount * $data['quantity'];

        $this->helpers->validateUserSpendingLimit($user, $amount);

        try {
            DB::beginTransaction();

                $balance = $this->helpers->validateBalanceAndDeductAmount($user->id, $amount);

            $description = "$examType->name Pin  Purchase";

            $transactionData = [
                'reference_id' => $this->helpers->generateTransactionRef('RC'),
                'user_id' => $user->id,
                'type' => 'RESULT_CHECKER',
                'provider_name' => $examType->name,
                'provider_id' => (string) $examType->id,
                'product_category' => 'RESULT_CHECKER',
                'amount' => $amount,
                'status' => 'PENDING',
                'description'=>  $description,
                'balance_before' => (float)$balance['before'],
                'balance_after' => (float)$balance['after'],
                'api_process_started_at' => now(),
                'metadata' => [
                    'exam_type_id' => $examType->id,
                    'exam_type' => $examType->name,
                    'quantity' => (int) $data['quantity'],
                    'beneficiary' => $user->phone ?? null,
                ],
            ];

            $transaction = Transaction::create($transactionData);

            DB::commit();

            // Log The Transaction
            Log::channel('general_transactions')
                    ->info('Result Checker', [
                    'email'=> $user->email,
                    'ip'=> $request->ip(),
                    'amount'=> $amount,
                    'exam'=> $examType->name,
                    'quantity'=> $data['quantity'],
                    'balance_before'=>(float)$balance['before'],
                    'balance_after'=> (float)$balance['after'],
                ]);

            return $transaction;

        } catch (Exception $e) {
            DB::rollBack();

            Log::error($e->getMessage());

            throw ValidationException::withMessages([
                'status' => $e->getMessage() ?? 'Something Went Wrong! Try again later.',
            ]);

        }

    }
}
