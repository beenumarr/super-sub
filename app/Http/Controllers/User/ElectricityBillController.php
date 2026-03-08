<?php

namespace App\Http\Controllers\User;

use Exception;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Actions\ValidateMeter;
use Illuminate\Support\Facades\DB;
use App\Actions\PayElectricityBill;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\ElectricityDistributor;
use Illuminate\Support\Facades\Schema;
use App\Models\ElectricityBillTransaction;
use Illuminate\Http\Request as HttpRequest;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\TransactionDetailResource;
use App\Http\Resources\ElectricityDistributorResource;
use App\Http\Requests\Transaction\ElectricityBillRequest;

class ElectricityBillController extends Controller
{
    protected $helpers;
    protected $payElectricityBill;

    public function __construct(TransactionHelper $helpers, PayElectricityBill $payElectricityBill)
    {
        $this->helpers = $helpers;
        $this->payElectricityBill = $payElectricityBill;
    }


    public function index(Request $request)
    {
        $electricity_distributions = ElectricityDistributorResource::collection(ElectricityDistributor::whereActive(1)->get());

        if($request->wantsJson()){
            return response($electricity_distributions);
        }

        return Inertia::render('ElectricityBill/Index', [
            'electricity_distributions' => $electricity_distributions,
        ]);
    }


    function store(ElectricityBillRequest $request) {

        $data = $request->all();

        $user = $request->user();

        $transaction = $this->performTransaction($request, $user, $data);


        $status = $this->payElectricityBill->handle($transaction);

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

    function validateMeter(HttpRequest $request, ValidateMeter $validateMeter) {

        $response = $validateMeter->handle($request->meter_number, $request->disco_name, $request->meter_type);


        if(isset($response['status'] ) && $response['status'] === 'success'){

            return $response;

        }else{

            throw ValidationException::withMessages([
                'status' => $error ?? 'Something Went Wrong! Try again Letter',
            ]);

        }

    }


    function performTransaction(Request $request, $user, $data) {

        $this->helpers->checkServiceActive($user, $data['electricity_distributor_id'], 'electricity');

        $distributor = ElectricityDistributor::find($data['electricity_distributor_id']);

        $amount = $distributor->applyPackageCharges($data['amount']);

        $this->helpers->validateUserSpendingLimit($user, $amount);


        try {
            DB::beginTransaction();

            $balance = $this->helpers->validateBalanceAndDeductAmount($user->id, $amount);


            $transactionable = ElectricityBillTransaction::create([
                'electricity_distributor_id'=> $data['electricity_distributor_id'],
                'meter_number' => $data['meter_number'],
                'meter_type' => $data['meter_type'],
                // 'amount' => $amount,
                'name' => $data['name'],
                'address' => $data['address'] ?? 'Nill',
                'phone_number' => auth()->user()->phone,
            ]);


            $description = "{$data['amount']} {$transactionable->distributor->name} Bill Payment  to {$data['meter_number']} {$data['meter_type']} ({$data['name']})";



            $transactionData = [
                'reference' => $this->helpers->generateTransactionRef('EB'),
                'user_id' => $user->id,
                'amount' => $data['amount'],
                'description'=>  $description,
                'balance_before' => (float)$balance['before'],
                'balance_after' => (float)$balance['after'],
            ];



            //! if doesn
            if (Schema::hasColumn('transactions', 'request_ip')) {
                $transactionData['request_ip'] = $request->ip();
            }

            $transaction = $transactionable->transaction()->create($transactionData);


            DB::commit();

            // Log The Transaction
            Log::channel('general_transactions')
                    ->info('Bill Payment', [
                    'email'=> $user->email,
                    'ip'=> $request->ip(),
                    'amount'=> $amount,
                    'meter_type'=> $data['meter_type'],
                    'meter_number'=> $data['meter_number'],
                    'distributor'=> $distributor->name,
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
