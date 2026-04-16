<?php

namespace App\Http\Controllers\User;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\DataPlan;
use Illuminate\Http\Request;
use App\Models\MobileNetwork;
use App\Models\Transaction;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Schema;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Validation\ValidationException;
use App\Actions\APIs\Kirani\ValidateNumber;
use App\Actions\BuySmile;
use App\Http\Resources\ApiTransactionResource;
use App\Http\Requests\Transaction\BuySmileApiRequest;

class SmileTransactionController extends Controller
{
    protected $helpers;
    protected $buySmile;

    public function __construct(TransactionHelper $helpers, BuySmile $buySmile)
    {
        $this->helpers = $helpers;
        $this->buySmile = $buySmile;
    }

    /**
     * Display the Smile bundle page.
     */
    public function index(): Response
    {
        // Get SMILE network - check by name or create a configurable ID
        $smileNetwork = MobileNetwork::with(['dataPlanTypes.dataPlans'])
            ->where('name', 'SMILE')
            ->orWhere('name', 'LIKE', '%SMILE%')
            ->first();

        $plans = [];

        if ($smileNetwork) {
            // Get all data plans for SMILE network through data_plan_types
            $plans = DataPlan::whereHas('planType', function ($query) use ($smileNetwork) {
                $query->where('mobile_network_id', $smileNetwork->id);
            })->where('active', 1)->orderBy('amount')->get();
        }

        return Inertia::render('Smile/Index', [
            'plans' => $plans,
        ]);
    }

    /**
     * Validate a Smile phone number.
     * Note: Using Kirani ValidateNumber for now as it may work for Smile too
     * or create a separate validator if needed
     */
    public function validateNumber(Request $request, ValidateNumber $validateNumber)
    {
        $request->validate([
            'phone_number' => 'required|string|min:10|max:15',
        ]);

        $response = $validateNumber->handle($request->phone_number);

        if ($response['status'] === 'failed') {
            throw ValidationException::withMessages([
                'phone_number' => $response['message'] ?? 'Invalid Smile number',
            ]);
        }

        return response()->json($response);
    }

    /**
     * Get plans for Smile network.
     */
    public function filterPlans()
    {
        $smileNetwork = MobileNetwork::where('name', 'SMILE')
            ->orWhere('name', 'LIKE', '%SMILE%')
            ->first();

        if (!$smileNetwork) {
            return response()->json([]);
        }

        $plans = DataPlan::whereHas('planType', function ($query) use ($smileNetwork) {
            $query->where('mobile_network_id', $smileNetwork->id);
        })->where('active', 1)->orderBy('amount')->get();

        return response()->json($plans);
    }

    /**
     * Process a Smile bundle transaction.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'phone_number' => 'required|string|min:10|max:15',
            'data_plan_id' => 'required|exists:data_plans,id',
            'customer_name' => 'nullable|string',
            'actype' => 'required|in:AccountNumber,PhoneNumber',
        ]);

        $user = $request->user();

        $api = TransactionApi::where('model', "APIs\\ArewaGlobal\\")->first();

        $transaction = $this->performTransaction($request, $user, $data);

        // Process the transaction using the ArewaGlobal API
        $status = $this->buySmile->handle($transaction, $api, $request->actype);

        if ($status !== 'SUCCESS') {
            $error = $transaction->api_response;

            throw ValidationException::withMessages([
                'status' => $error ?? 'Something Went Wrong! Try again later',
            ]);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Transaction successful',
                'transaction' => $transaction,
            ]);
        }

        return back();
    }

    /**
     * Process a Smile bundle via API.
     */
    public function storeApi(BuySmileApiRequest $request)
    {
        $data = $request->validated();

        $user = $request->user();

        // Map API field names to internal field names
        $data['phone_number'] = $data['mobile_number'];
        $data['data_plan_id'] = $data['plan'];

        $api = TransactionApi::where('model', "APIs\\ArewaGlobal\\")->first();

        $transaction = $this->performTransaction($request, $user, $data);

        $status = $this->buySmile->handle($transaction, $api, $data['actype']);

        if ($status === 'SUCCESS') {
            return response(new ApiTransactionResource($transaction), 200);
        }

        $error = $transaction->api_response;

        throw ValidationException::withMessages([
            'status' => $error ?? 'Something Went Wrong! Try again later',
        ]);
    }

    /**
     * Perform the transaction (deduct balance, create records).
     */
    function performTransaction(Request $request, $user, $data)
    {
        $plan = DataPlan::findOrFail($data['data_plan_id']);

        // Validate the plan belongs to SMILE network
        $smileNetwork = MobileNetwork::where('name', 'SMILE')
            ->orWhere('name', 'LIKE', '%SMILE%')
            ->first();

        if (!$smileNetwork || $plan->planType->mobile_network_id !== $smileNetwork->id) {
            throw ValidationException::withMessages([
                'status' => 'Invalid plan selected',
            ]);
        }

        $amount = $plan->useramount;

        $this->helpers->validateUserSpendingLimit($user, $amount);

        $description = "{$plan->size} Bundle SMILE to {$data['phone_number']}";

        try {
            DB::beginTransaction();

            $balance = $this->helpers->validateBalanceAndDeductAmount($user->id, $amount);

            $transactionData = [
                'reference_id' => $this->helpers->generateTransactionRef('SM'),
                'user_id' => $user->id,
                'amount' => $amount,
                'type' => 'DATA',
                'provider_name' => $smileNetwork->name,
                'provider_id' => (string) $smileNetwork->id,
                'product_category' => 'DATA',
                'product_id' => (string) $plan->id,
                'status' => 'PENDING',
                'description' => $description,
                'balance_before' => (float) $balance['before'],
                'balance_after' => (float) $balance['after'],
                'api_process_started_at' => now(),
                'metadata' => [
                    'beneficiary' => $data['phone_number'],
                    'network_id' => $smileNetwork->id,
                    'network' => $smileNetwork->name,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name ?? null,
                    'plan_category' => 'SMILE',
                    'actype' => $data['actype'] ?? null,
                ],
            ];

            if (Schema::hasColumn('transactions', 'request_ip')) {
                $transactionData['request_ip'] = $request->ip();
            }

            $transaction = Transaction::create($transactionData);

            DB::commit();

            Log::channel('general_transactions')
                ->info('Smile Bundle Purchase', [
                    'email' => $user->email,
                    'ip' => $request->ip(),
                    'amount' => $amount,
                    'plan' => $plan->size . ' Bundle',
                    'beneficiary' => $data['phone_number'],
                    'balance_before' => (float) $balance['before'],
                    'balance_after' => (float) $balance['after'],
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
