<?php

namespace App\Http\Controllers\User;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\DataPlan;
use App\Models\DataPlanType;
use Illuminate\Http\Request;
use App\Models\MobileNetwork;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Schema;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Validation\ValidationException;
use App\Actions\APIs\Kirani\ValidateNumber;
use App\Actions\BuyKirani;
use App\Http\Resources\ApiTransactionResource;
use App\Http\Requests\Transaction\BuyKiraniApiRequest;

class KiraniTransactionController extends Controller
{
    protected $helpers;
    protected $buyKirani;

    public function __construct(TransactionHelper $helpers, BuyKirani $buyKirani)
    {
        $this->helpers = $helpers;
        $this->buyKirani = $buyKirani;
    }

    /**
     * Display the Kirani subscription page.
     */
    public function index(): Response
    {
        // Get KIRANI network (id = 5)
        $kiraniNetwork = MobileNetwork::with(['dataPlanTypes.dataPlans'])
            ->where('id', 5)
            ->where('name', 'KIRANI')
            ->first();

        $plans = [];

        if ($kiraniNetwork) {
            // Get all data plans for KIRANI network through data_plan_types
            $plans = DataPlan::whereHas('planType', function ($query) use ($kiraniNetwork) {
                $query->where('mobile_network_id', $kiraniNetwork->id);
            })->where('active', 1)->orderBy('amount')->get();
        }

        return Inertia::render('KiraniSubscription/Index', [
            'kirani_network' => $kiraniNetwork,
            'plans' => $plans,
        ]);
    }

    /**
     * Validate a Kirani phone number.
     */
    public function validateNumber(Request $request, ValidateNumber $validateNumber)
    {
        $request->validate([
            'phone_number' => 'required|string|min:10|max:15',
        ]);

        $response = $validateNumber->handle($request->phone_number);

        if ($response['status'] === 'failed') {
            throw ValidationException::withMessages([
                'phone_number' => $response['message'] ?? 'Invalid Kirani number',
            ]);
        }

        return response()->json($response);
    }

    /**
     * Get plans for Kirani network.
     */
    public function filterPlans()
    {
        $kiraniNetwork = MobileNetwork::where('id', 5)
            ->where('name', 'KIRANI')
            ->first();

        if (!$kiraniNetwork) {
            return response()->json([]);
        }

        $plans = DataPlan::whereHas('planType', function ($query) use ($kiraniNetwork) {
            $query->where('mobile_network_id', $kiraniNetwork->id);
        })->where('active', 1)->orderBy('amount')->get();

        return response()->json($plans);
    }

    /**
     * Process a Kirani subscription transaction.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'phone_number' => 'required|string|min:10|max:15',
            'data_plan_id' => 'required|exists:data_plans,id',
            'customer_name' => 'nullable|string',
        ]);

        $user = $request->user();

        $transaction = $this->performTransaction($request, $user, $data);

        // Process the transaction using the Kirani API
        $status = $this->buyKirani->handle($transaction);

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
     * Process a Kirani subscription via API.
     */
    public function storeApi(BuyKiraniApiRequest $request)
    {
        $data = $request->validated();

        $user = $request->user();

        // Map API field names to internal field names
        $data['phone_number'] = $data['mobile_number'];
        $data['data_plan_id'] = $data['plan'];

        $transaction = $this->performTransaction($request, $user, $data);

        $status = $this->buyKirani->handle($transaction);

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
    protected function performTransaction(Request $request, $user, $data)
    {
        $plan = DataPlan::findOrFail($data['data_plan_id']);

        // Validate the plan belongs to KIRANI network
        $kiraniNetwork = MobileNetwork::where('id', 5)->where('name', 'KIRANI')->first();

        if (!$kiraniNetwork || $plan->planType->mobile_network_id !== $kiraniNetwork->id) {
            throw ValidationException::withMessages([
                'status' => 'Invalid plan selected',
            ]);
        }

        $amount = $plan->useramount;

        $this->helpers->validateUserSpendingLimit($user, $amount);

        $description = "{$plan->size} Minutes KIRANI to {$data['phone_number']}";

        try {
            DB::beginTransaction();

            $balance = $this->helpers->validateBalanceAndDeductAmount($user->id, $amount);

            $transactionData = [
                'reference_id' => $this->helpers->generateTransactionRef('KR'),
                'user_id' => $user->id,
                'amount' => $amount,
                'type' => 'DATA',
                'provider_name' => $kiraniNetwork->name,
                'provider_id' => (string) $kiraniNetwork->id,
                'product_category' => 'DATA',
                'product_id' => (string) $plan->id,
                'status' => 'PENDING',
                'description' => $description,
                'balance_before' => (float) $balance['before'],
                'balance_after' => (float) $balance['after'],
                'api_process_started_at' => now(),
                'metadata' => [
                    'beneficiary' => $data['phone_number'],
                    'network_id' => $kiraniNetwork->id,
                    'network' => $kiraniNetwork->name,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name ?? null,
                    'plan_category' => 'KIRANI',
                ],
            ];

            if (Schema::hasColumn('transactions', 'request_ip')) {
                $transactionData['request_ip'] = $request->ip();
            }

            $transaction = Transaction::create($transactionData);

            DB::commit();

            Log::channel('general_transactions')
                ->info('Kirani Subscription', [
                    'email' => $user->email,
                    'ip' => $request->ip(),
                    'amount' => $amount,
                    'plan' => $plan->size . ' Minutes',
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
