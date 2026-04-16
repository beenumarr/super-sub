<?php

namespace App\Http\Controllers\User;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use App\Actions\BuyData;
use App\Models\DataPlan;
use Illuminate\Support\Str;
use App\Models\DataPlanType;
use Illuminate\Http\Request;
use App\Models\MobileNetwork;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use App\Http\Resources\DataPlanTypeResource;
use App\Utils\Transaction\TransactionHelper;
use App\Http\Resources\MobileNetworkResource;
use App\Http\Resources\ApiTransactionResource;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\Transaction\BuyDataRequest;
use App\Http\Resources\TransactionDetailResource;
use App\Http\Requests\Transaction\BuyDataApiRequest;

class BuyDataController extends Controller
{
    protected $helpers;
    protected $buyData;

    public function __construct(TransactionHelper $helpers, BuyData $buyData)
    {
        $this->helpers = $helpers;
        $this->buyData = $buyData;
    }

    public function index(): Response
    {
        // Eager load necessary relationships
        $dataPlanTypes = DataPlanType::where('active', 1)
            ->with([
                'network.addon', // Load `addon` directly through the `network` relationship
                'dataPlans.apis', // Load `apis` directly through the `dataPlans` relationship
                'dataPlans.planType',
                'dataPlans.planType.network',
                'api'
            ])
            ->get();


        $mobile_network = MobileNetworkResource::collection(MobileNetwork::with([
            'addon.package',
            'dataPlanTypes.dataPlans.apis',
        ])->whereNotIn('name', ['KIRANI', 'SMILE'])->get());

        return Inertia::render('BuyData/Index', [
            'mobile_networks' => $mobile_network,
            'data_plan_types' => DataPlanTypeResource::collection($dataPlanTypes),
        ]);
    }



    public function dataPlans() {

        $default_datatype = config('settings.default_data_type') ?? 1;


        $dataPlanTypes = DataPlanType::where('active', 1)
        ->with([
            'network.addon', // Load `addon` directly through the `network` relationship
            'dataPlans.apis', // Load `apis` directly through the `dataPlans` relationship
            'dataPlans.planType',
            'dataPlans.planType.network',
            'api'
        ])->orderByRaw("CASE WHEN id = $default_datatype THEN 0 ELSE 1 END")
        ->get();


    $mobile_network = MobileNetworkResource::collection(MobileNetwork::with([
        'addon.package',
        'dataPlanTypes.dataPlans.apis',
    ])->get());

        return response([
              'mobile_networks' => $mobile_network,
              'data_plan_types' => DataPlanTypeResource::collection($dataPlanTypes),
        ]);

    }




    function store(BuyDataRequest $request) {

        $data = $request->all();

        $user = $request->user();

        $transaction = $this->performTransaction($request, $user, $data);

        $status = $this->buyData->handle($transaction);

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



    function storeApi(BuyDataApiRequest $request) {

        $data = $request->validated();

        $user = $request->user();

        $data['phone_number'] = $data['mobile_number'];

        $data['mobile_network'] = $data['network'];

        $data['data_plan_id'] = $data['plan'];

        $transaction = $this->performTransaction($request, $user, $data);

        $status = $this->buyData->handle($transaction);

        if($status === 'SUCCESS'){

            return response(new ApiTransactionResource($transaction), 200);

        }

        else{
            $error = $transaction->api_response;

            throw ValidationException::withMessages([
                'status' => $error ?? 'Something Went Wrong! Try again Letter',
            ]);
        }



    }

    public function filterDataPlanType()
    {
        $response = [];

        if($mobile_network_id = request('mobile_network_id')){
                $response =  [
                    'data_plan_types' => DataPlanType::where('mobile_network_id', $mobile_network_id )->orderBy('id')->get(),
                    'data_plans' => DataPlanType::first()->dataPlans()->orderBy('id')->get(),
            ];
        }
      return $response;

    }

    public function filterDataPlan()
    {
        $response = [];

        if($data_plan_type_id = request('data_plan_type_id')){
            $response =  DataPlan::where('data_plan_type_id', $data_plan_type_id )->orderBy('id')->get();
        }

      return $response;

    }


    function performTransaction(Request $request, $user, $data) {

        $this->helpers->checkServiceActive($user, $data['data_plan_id'], 'data');

        $plan = DataPlan::find($data['data_plan_id']);

        $this->helpers->validateUserSpendingLimit($user, $plan->useramount);

        $description = Str::upper($plan->size."".$plan->volume) ." Data ".$plan->network." to ". $data['phone_number'];


        try {
            DB::beginTransaction();

            $balance = $this->helpers->validateBalanceAndDeductAmount($user->id, $plan->useramount);

            $transactionData = [
                'reference_id' => $this->helpers->generateTransactionRef('DT'),
                'user_id' => $user->id,
                'type' => 'DATA',
                'provider_name' => $plan->network,
                'provider_id' => (string) $data['mobile_network'],
                'product_id' => (string) $plan->id,
                'product_category' => 'DATA',
                'amount' => $plan->useramount,
                'status' => 'PENDING',
                'description' => $description,
                'balance_before' => (float) $balance['before'],
                'balance_after' => (float) $balance['after'],
                'api_process_started_at' => now(),
                'metadata' => [
                    'beneficiary' => $data['phone_number'],
                    'network_id' => $data['mobile_network'],
                    'network' => $plan->network,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name ?? null,
                    'plan_category' => $plan->planType?->name ?? null,
                    'dispense_channel' => $data['dispense_channel'] ?? null,
                ],
            ];

            if (Schema::hasColumn('transactions', 'request_ip')) {
                $transactionData['request_ip'] = $request->ip();
            }

            $transaction = Transaction::create($transactionData);

            DB::commit();

            Log::channel('data_transactions')
                    ->info('Data Purchased', [
                    'email'=> $user->email,
                    'ip'=> $request->ip(),
                    'amount'=> $plan->amount,
                    'plan'=> $plan->name,
                    'beneficiary'=> $data['phone_number'],
                    'network'=> $data['mobile_network'],
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

        // finally {
        //     $lock->release();
        // }
    }





}
