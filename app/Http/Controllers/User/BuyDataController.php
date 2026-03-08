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
use App\Models\DataTransaction;
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
        // Load active networks (excluding KIRANI/SMILE) for the new TSX page
        $networks = MobileNetwork::whereNotIn('name', ['KIRANI', 'SMILE'])->get();

        // Load active data plan types and related data plans
        $dataPlanTypes = DataPlanType::where('active', 1)
            ->with(['dataPlans', 'network'])
            ->get();

        // Flatten data plans across all types
        $dataPlans = $dataPlanTypes->flatMap(function (DataPlanType $type) {
            return $type->dataPlans->map(function (DataPlan $plan) use ($type) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'price' => $plan->useramount,
                    'size' => $plan->size,
                    'volume' => $plan->volume,
                    'validity' => $plan->validity,
                    'description' => null,
                    'category' => [
                        'id' => $type->id,
                        'name' => $type->name,
                        'network_id' => $type->mobile_network_id,
                    ],
                    'data_plan_category_id' => $type->id,
                ];
            });
        })->values();

        // Map networks into the shape expected by DataTransactions/Index.tsx
        $networksPayload = $networks->map(function (MobileNetwork $network) {
            return [
                'id' => $network->id,
                'name' => $network->name,
                'status' => $network->data_active ? 'ACTIVE' : 'INACTIVE',
            ];
        })->values();

        // Categories are mirrored from DataPlanType
        $categories = $dataPlanTypes->map(function (DataPlanType $type) {
            return [
                'id' => $type->id,
                'name' => $type->name,
                'network_id' => $type->mobile_network_id,
            ];
        })->values();

        return Inertia::render('DataTransactions/Index', [
            'networks' => $networksPayload,
            'categories' => $categories,
            'dataPlans' => $dataPlans,
            'message' => session('message'),
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

       if($status != 'success'){

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

        if($status === 'success'){

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

            $transactionable = DataTransaction::create([
                'phone_number' => $data['phone_number'],
                'mobile_network_id' => $data['mobile_network'],
                'data_plan_id' => $plan->id,
            ]);

            $transactionData = [
                'reference' => $this->helpers->generateTransactionRef('DT'),
                'user_id' => $user->id,
                'amount' => $plan->useramount,
                'description'=>  $description,
                'balance_before' => (float)$balance['before'],
                'balance_after' => (float)$balance['after'],
            ];

            if (Schema::hasColumn('transactions', 'request_ip')) {
                $transactionData['request_ip'] = $request->ip();
            }

            $transaction = $transactionable->transaction()->create($transactionData);

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
