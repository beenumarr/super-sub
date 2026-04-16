<?php

namespace App\Http\Controllers\User;

use Exception;
use Inertia\Inertia;
use App\Actions\ValidateICU;
use App\Models\CableNetwork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Actions\BuyCableSubscription;
use App\Models\CableSubscriptionPlan;
use App\Models\ElectricityDistributor;
use App\Models\Transaction;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request as HttpRequest;
use App\Http\Resources\CableNetworkResource;
use App\Models\CableSubscriptionTransaction;
use App\Utils\Transaction\TransactionHelper;
use App\Http\Resources\ApiTransactionResource;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\TransactionDetailResource;
use App\Http\Resources\ElectricityDistributorResource;
use App\Http\Requests\Transaction\CableSubscriptionRequest;

class CableSubscriptionController extends Controller
{
    protected $helpers;
    protected $buyCableSubscription;

    public function __construct(TransactionHelper $helpers, BuyCableSubscription $buyCableSubscription)
    {
        $this->helpers = $helpers;
        $this->buyCableSubscription = $buyCableSubscription;
    }

    public function index(HttpRequest $request)
    {
        $cable_networks = CableNetworkResource::collection(CableNetwork::all());

        if($request->wantsJson()){
            return response($cable_networks);
        }


        return Inertia::render('CableSubscription/Index', [
            'cable_networks' => $cable_networks,
            'electricity_distributors' => ElectricityDistributorResource::collection(ElectricityDistributor::all()),
        ]);
    }


    function store(CableSubscriptionRequest $request) {

        $data = $request->all();

        $user = $request->user();

        $transaction = $this->performTransaction($request, $user, $data);

        $status = $this->buyCableSubscription->handle($transaction);

       if($status !== 'SUCCESS'){

           $error = $transaction->api_response;

           throw ValidationException::withMessages([
                'status' => $error ?? 'Something Went Wrong! Try again Letter',
            ]);
        }

        if($request->wantsJson() ){

            return response(new TransactionDetailResource($transaction, withTransactionable: false));

        }

        return back();


    }


    function storeApi(CableSubscriptionRequest $request) {

        $data = $request->all();

        $user = $request->user();

        $transaction = $this->performTransaction($request, $user, $data);

        $status = $this->buyCableSubscription->handle($transaction);

       if($status !== 'SUCCESS'){
                $error = $transaction->api_response;

                throw ValidationException::withMessages([
                    'status' => $error ?? 'Something Went Wrong! Try again Letter',
                ]);
            }

        return response(new ApiTransactionResource($transaction));


    }

    function validateIcu(HttpRequest $request, ValidateICU $validateICU) {

        try {
            $response = $validateICU->handle($request->smart_card_number, $request->cable_name);

            if($response['status'] === 'failed'){
                return response()->json([
                    'status' => 'failed',
                    'name' => $response['name'] ?? 'Validation failed'
                ], 422);
            }

            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'failed',
                'name' => $e->getMessage() ?? 'Validation failed'
            ], 422);
        }

    }

    public function filterPlans()
    {
        $response = [];

        if($cable_network_id = request('cable_network_id')){
                $response =  CableSubscriptionPlan::where('cable_network_id', $cable_network_id )->orderBy('id')->get();
        }
      return response()->json($response);
    }

    function performTransaction(Request $request, $user, $data) {

        $this->helpers->checkServiceActive($user, $data['cable_subscription_plan_id'], 'cable');

        // $this->helpers->checkDuplicate($user, 1);

        $plan = CableSubscriptionPlan::find($data['cable_subscription_plan_id']);

        $amount = $plan->cableProvider->applyPackageCharges($plan->amount);

        $this->helpers->validateUserSpendingLimit($user, $amount);


        try {
            DB::beginTransaction();

                $balance = $this->helpers->validateBalanceAndDeductAmount($user->id, $amount);
                $provider = $plan->cableProvider;

            $description = ($plan->package_name ?? 'Cable Subscription')
                ." {$amount} {$provider?->name} Cable Subscription to {$data['smart_card_number']} ({$data['name']})";

            $transactionData = [
                'reference_id' => $this->helpers->generateTransactionRef('CS'),
                'user_id' => $user->id,
                'amount' => $amount,
                'type' => 'CABLE',
                'provider_name' => $provider?->name,
                'provider_id' => (string) $plan->cable_network_id,
                'product_category' => 'CABLE',
                'product_id' => (string) $plan->id,
                'status' => 'PENDING',
                'description' => $description,
                'balance_before' => (float)$balance['before'],
                'balance_after' => (float)$balance['after'],
                'api_process_started_at' => now(),
                'metadata' => [
                    'smart_card_number' => $data['smart_card_number'],
                    'name' => $data['name'],
                    'phone_number' => $user->phone ?? null,
                    'network_id' => $plan->cable_network_id,
                    'network' => $provider?->name,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->package_name ?? null,
                    'product_code' => $plan->product_code ?? null,
                    'beneficiary' => $data['smart_card_number'],
                ],
            ];

            //! if doesn
            if (Schema::hasColumn('transactions', 'request_ip')) {
                $transactionData['request_ip'] = $request->ip();
            }

            $transaction = Transaction::create($transactionData);

            DB::commit();

            // Log The Transaction
            Log::channel('general_transactions')
                    ->info('Cable Subscription', [
                    'email'=> $user->email,
                    'ip'=> $request->ip(),
                    'amount'=> $amount,
                    'plan'=> $plan->name,
                    'beneficiary'=> $data['smart_card_number'],
                    'cable_name'=> $data['cable_name'],
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
