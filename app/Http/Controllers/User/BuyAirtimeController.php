<?php

namespace App\Http\Controllers\User;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use App\Actions\BuyAirtime;
use Illuminate\Http\Request;
use App\Models\MobileNetwork;
use App\Models\AirtimeTransaction;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use App\Utils\Transaction\TransactionHelper;
use App\Http\Resources\MobileNetworkResource;
use App\Http\Resources\ApiTransactionResource;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\TransactionDetailResource;
use App\Http\Requests\Transaction\BuyAirtimeRequest;
use App\Http\Requests\Transaction\BuyAirtimeApiRequest;

class BuyAirtimeController extends Controller
{
    protected $helpers;
    protected $buyAirtime;

    public function __construct(TransactionHelper $helpers, BuyAirtime $buyAirtime)
    {
        $this->helpers = $helpers;
        $this->buyAirtime = $buyAirtime;
    }


    public function index(): Response
    {

        return Inertia::render('BuyAirtime/Index', [
            'mobile_networks' => MobileNetworkResource::collection(MobileNetwork::whereNotIn('name', ['KIRANI', 'SMILE'])->get()),
        ]);
    }


    function store(BuyAirtimeRequest $request) {

        $data = $request->validated();

        $user = $request->user();

        $this->helpers->validateTransactionPin($user, $request->input('transaction_pin'));

        $transaction = $this->performTransaction($request, $user, $data);

        $status = $this->buyAirtime->handle($transaction);


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


    function storeApi(BuyAirtimeApiRequest $request) {

        $data = $request->validated();

        $user = $request->user();

        $data['phone_number'] = $data['mobile_number'];

        $data['mobile_network'] = $data['network'];

        $transaction = $this->performTransaction($request, $user, $data);

        $status = $this->buyAirtime->handle($transaction);


        if($status !== 'SUCCESS'){
                $error = $transaction->api_response;

                throw ValidationException::withMessages([
                    'status' => $error ?? 'Something Went Wrong! Try again Letter',
                ]);
            }

        return response(new ApiTransactionResource($transaction));

    }






    function performTransaction(Request $request, $user, $data) {
        $this->helpers->checkServiceActive($user, $data['mobile_network'], 'airtime');

        $discount = $this->helpers->getAirtimeDiscount($user, $data['mobile_network'], $data['amount']);

        $this->helpers->validateUserSpendingLimit($user, $data['amount']);

        try {
            DB::beginTransaction();

            $balance = $this->helpers->validateBalanceAndDeductAmount($user->id, $data['amount'] - $discount);
            $network = MobileNetwork::findOrFail($data['mobile_network']);

            $description = $data['amount']." ".$network->name." Airtime to ". $data['phone_number'];

            $transactionData = [
                'reference_id' => $this->helpers->generateTransactionRef('AT'),
                'user_id' => $user->id,
                'type' => 'AIRTIME',
                'provider_name' => $network->name,
                'provider_id' => (string) $network->id,
                'product_category' => 'AIRTIME',
                'amount' => $data['amount'] - $discount,
                'status' => 'PENDING',
                'description' => $description,
                'balance_before' => (float)$balance['before'],
                'balance_after' => (float)$balance['after'],
                'api_process_started_at' => now(),
                'metadata' => [
                    'beneficiary' => $data['phone_number'],
                    'network_id' => $network->id,
                    'network' => $network->name,
                    'requested_amount' => (float) $data['amount'],
                    'discount' => (float) $discount,
                ],
            ];

            if (Schema::hasColumn('transactions', 'request_ip')) {
                $transactionData['request_ip'] = $request->ip();
            }

            $transaction = Transaction::create($transactionData);

            DB::commit();

             // Log The Transaction
            Log::channel('airtime_transactions')
            ->info('Data Purchased', [
            'email'=> $user->email,
            'ip'=> $request->ip(),
            'amount'=> $data['amount'],
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
    }








}
