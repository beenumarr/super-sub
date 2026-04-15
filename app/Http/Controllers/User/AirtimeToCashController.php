<?php

namespace App\Http\Controllers\User;

use Exception;
use Inertia\Inertia;
use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Models\MobileNetwork;
use App\Models\AppConfiguration;
use App\Services\AutoPilotService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\AirtimeToCashTransaction;
use App\Models\Transaction;
use App\Utils\Transaction\TransactionHelper;
use App\Http\Resources\MobileNetworkResource;
use App\Http\Resources\A2CTransactionResource;
use Illuminate\Validation\ValidationException;
use App\Http\Resources\TransactionDetailResource;
use App\Http\Requests\Transaction\AirtimeToCashRequest;

class AirtimeToCashController extends Controller
{
    protected $autoPilotService;
    protected $helpers;
    public function __construct(AutoPilotService $autoPilotService)
    {
        $this->autoPilotService = $autoPilotService;
        $this->helpers = new  TransactionHelper();
    }


    /**
     * Display the Airtime to Cash page.
     */
    public function index(Request $request)
    {

        $pageSize = $request->input('pageSize', 10);

        if ($request->wantsJson()) {
            $pageSize = $request->input('pageSize', 3);
        }

        $currentPage = $request->input('page', 1);

        $query = AirtimeToCashTransaction::where('user_id', auth()->id())->latest();

        $transactions = $query->paginate($pageSize, ['*'], 'page', $currentPage);

        $transactionResources = A2CTransactionResource::collection($transactions);

        if ($request->wantsJson()) {
            return response($transactionResources);
        }

        $networks = MobileNetwork::all();


        $recievePhoneNumbers = [
            "MTN"=> config('settings.a2c_mtn_phone_number'),
            "GLO"=> config('settings.a2c_glo_phone_number'),
            "9MOBILE"=> config('settings.a2c_ninemoble_phone_number'),
            "AIRTEL"=> config('settings.a2c_airtel_phone_number'),
        ];

        $configKeys = [
            'a2c_enabled',
            'a2c_auto_method_enabled',
            'a2c_manual_method_enabled',
            'a2c_min_amount',
            'a2c_max_amount',
            'a2c_daily_limit',
            'a2c_conversion_rate',
            'a2c_withdrawal_fee',
        ];



        $configs = AppConfiguration::whereIn('key', $configKeys)
            ->get()
            ->pluck('value', 'key')
            ->toArray();

        return Inertia::render('AirtimeToCash/Index', [
            'data' => session('data'),
            'transactions'=> $transactionResources,
            'mobile_networks' => MobileNetworkResource::collection($networks),
            'receiverPhoneNumbers' => $recievePhoneNumbers,
            'configs' => $configs,
        ]);
    }


    public function manualMethod(Request $request) {
        $data = $request->validate([
            'amount' => 'required|numeric|min:50|max:5000',
            'network' => 'required|exists:mobile_networks,id',
            'senderPhone' => 'required|string',
            'receiverPhone' => 'required|string',
            'hasTransferred' => 'required|boolean',
        ]);



        $configKeys = [
            'a2c_enabled',
            'a2c_auto_method_enabled',
            'a2c_manual_method_enabled',
            'a2c_min_amount',
            'a2c_max_amount',
            'a2c_daily_limit',
            'a2c_conversion_rate',
            'a2c_withdrawal_fee',
        ];

        $configs = AppConfiguration::whereIn('key', $configKeys)
        ->get()
        ->pluck('value', 'key')
        ->toArray();

        $user = auth()->user();

        if (!$data['hasTransferred']) {
            throw ValidationException::withMessages([
                'hasTransferred' => 'Please confirm that you have transferred the airtime.'
            ]);
        }

        $network = MobileNetwork::find($data['network']);

        if(!$network) {
            throw ValidationException::withMessages([
                'network' => 'Network not found.'
            ]);
        }

        if(!$network->a2c_manual_method_enabled) {
            throw ValidationException::withMessages([
                'network' => 'Airtime to Cash is not active for this network.'
            ]);
        }

        $conversionRate = $network->a2c_conversion_rate;


        // Calculate quantity (same logic as in the UI)
        $quantity = $data['amount'] > 1000 ? floor($data['amount'] / 1000) : 1;

        try {
            DB::beginTransaction();

            $transaction = AirtimeToCashTransaction::create([
                'user_id' => $user->id,
                'amount' => $data['amount'],
                'converted_amount' => $data['amount'] * $conversionRate / 100,
                'quantity' => $quantity,
                'convertion_rate' => $conversionRate,
                'sessionId' => 'manual-' . time(),
                'mobile_network_id' => $data['network'],
                'phone_number' => $data['senderPhone'],
                'reference' => $this->helpers->generateTransactionRef('ATC'),
                'status' => 'processing',
                'api_response' => 'Manual transaction initiated',
                'receiver_phone' => $data['receiverPhone'],
                'is_manual' => true
            ]);

            DB::commit();

            return back()->with([
                'data' => [
                    'message' => 'Your airtime transfer has been submitted and is under review. You will be notified once it is processed.'
                ]
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Manual Airtime to Cash Error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'data' => $data,
                'exception' => $e,
            ]);

            throw ValidationException::withMessages([
                'error' => 'Failed to process your request. Please try again later.'
            ]);
        }
    }

    /**
     * Show the details of a specific Airtime to Cash transaction.
     */
    public function show(AirtimeToCashTransaction $transaction)
    {
        return new A2CTransactionResource($transaction);
    }

    public function transferToWallet(AirtimeToCashTransaction $transaction)
    {

        if($transaction->status !== 'transferred' || $transaction->status !== 'completed') {
            throw ValidationException::withMessages([
                'status' => 'Transaction not yet completed.'
            ]);
        }

        $user = auth()->user();
        $wallet = Wallet::lockForUpdate()->where('user_id', $user->id)->firstOrFail();
        $balance_before = $wallet->a2c_balance;

        DB::beginTransaction();
        $wallet->increment('a2c_balance', $transaction->converted_amount);
        $balance_after = $wallet->a2c_balance;

        Log::info('Airtime to Cash Transfer: ', [
            'user_id' => $user->id,
            'wallet_id' => $wallet->id,
            'amount' => $transaction->converted_amount,
            'balance_before' => $balance_before,
            'balance_after' => $balance_after,
        ]);

        DB::commit();

        $transaction->update([
            'status' => 'transferred',
        ]);

    }

    /**
     * Request OTP from AutoPilot.
     */
    public function requestOtp(Request $request)
    {
        $data = $request->all();

        $response = $this->autoPilotService->sendAirtimeToCashOtp($data['network'], $data['phone']);


        if (!isset($response['status']) || !$response['status']) {
            throw ValidationException::withMessages([
                'otp' => $response['message'] ?? 'OTP verification failed. Please try again.',
            ]);
        }

        return back()->with(['data'=> $response['data']]);
    }


    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'otp' => 'required',
            'identifier' => 'required|string',
        ]);

        $response = $this->autoPilotService->verifyAirtimeToCashOtp($validated['otp'], $validated['identifier']);

        info('OTP Verification Response:', $response);

        if (!isset($response['status']) || !$response['status']) {
            throw ValidationException::withMessages([
                'otp' => $response['message'] ?? 'OTP verification failed. Please try again.',
            ]);
        }

        return back()->with(['data' => $response['data']]);
    }


    /**
     * Send Airtime via AutoPilot.
     */
    public function send(Request $request)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:50|max:5000',
            'network' => 'required',
            'phone' => 'required',
            'sessionId' => 'required',
            'quantity' => 'required',
            'pin'=> 'required',
            'identifier' => 'required|string',
        ]);

        $user = auth()->user();

        $network = MobileNetwork::find($data['network']);

        if(!$network) {
            throw ValidationException::withMessages([
                'network' => 'Network not found.'
            ]);
        }

        if(!$network->a2c_auto_method_enabled) {
            throw ValidationException::withMessages([
                'network' => 'Airtime to Cash is not active for this network.'
            ]);
        }

        $conversionRate = $network->a2c_conversion_rate;

        $transaction = AirtimeToCashTransaction::create([
                'user_id' => $user->id,
                'amount' => $data['amount'],
                'converted_amount' => $data['amount'] * $conversionRate / 100,
                'convertion_rate' => $conversionRate,
                'quantity' => $data['quantity'],
                'sessionId' => $data['sessionId'],
                'mobile_network_id' => $data['network'],
                'phone_number' => $data['phone'],
                'reference' => $this->helpers->generateTransactionRef('ATC'),
        ]);

        $response = $this->autoPilotService->sendAirtimeToCash($data, $transaction);

        if($response['status'] === 'completed') {
                $this->transferToWallet($transaction);
        }

        return back()->with(['data' => ['message'=> $response['api_response'] ?? 'Transaction failed. Please try again.' ]]);
    }

    /**
     * Check Airtime transaction status via AutoPilot.
     */
    public function checkStatus(Request $request, $reference)
    {
        $transaction = Transaction::where('reference_id', $reference)->firstOrFail();

        return response()->json([
            'status' => $transaction->status,
            'amount' => $transaction->amount,
            'type' => $transaction->type,
            'reference_id' => $transaction->reference_id,
            'api_response' => $transaction->api_response ?? 'No response',
            'metadata' => $transaction->metadata,
        ]);
    }



}
