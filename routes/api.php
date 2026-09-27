<?php

use App\Http\Controllers\Api\VerificationApiController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\User\BuyAirtimeController;
use App\Http\Controllers\User\BuyDataController;
use App\Http\Controllers\User\CableSubscriptionController;
use App\Http\Controllers\User\ElectricityBillController;
use App\Http\Controllers\User\ResultCheckerController;
use App\Http\Middleware\ApiAuthenticate;
use App\Models\CableNetwork;
use App\Models\CableSubscriptionPlan;
use App\Models\DataPlan;
use App\Models\ElectricityDistributor;
use App\Models\ExamType;
use App\Models\MobileNetwork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider and assigned to
| the "api" middleware group. Protected routes require API key authentication.
|
*/

// Protected routes requiring authentication
Route::middleware([ApiAuthenticate::class, 'auth:sanctum'])->group(function () {
    // User Profile & Balance Check
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'wallet_balance' => (float) ($user->wallet?->balance ?? 0),
                'bonus_balance' => (float) ($user->wallet?->bonus_balance ?? 0),
                'package' => $user->package?->name ?? 'Standard',
            ],
            'message' => 'API connection successful',
        ]);
    });

    // Network & Catalog Lookup Routes
    Route::get('/networks', function () {
        return response()->json([
            'status' => 'success',
            'data' => MobileNetwork::whereNotIn('name', ['KIRANI', 'SMILE'])
                ->get(['id', 'name', 'code', 'data_active', 'airtime_active']),
        ]);
    });

    Route::get('/data/plans', function (Request $request) {
        $networkId = $request->input('network_id') ?? $request->input('network');
        $query = DataPlan::with('planType.network')->where('active', 1);

        if ($networkId) {
            $query->whereHas('planType', function ($q) use ($networkId) {
                $q->where('mobile_network_id', $networkId);
            });
        }

        $plans = $query->orderBy('amount')->get()->map(function ($plan) {
            return [
                'id' => $plan->id,
                'network_id' => $plan->planType?->mobile_network_id,
                'network_name' => $plan->planType?->network?->name,
                'plan_type' => $plan->planType?->name,
                'name' => $plan->name,
                'size' => $plan->size,
                'volume' => $plan->volume,
                'amount' => (float) $plan->amount,
                'validity' => $plan->validity,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $plans,
        ]);
    });

    Route::get('/cable/plans', function () {
        $plans = CableSubscriptionPlan::with('cableProvider')->get()->map(function ($plan) {
            return [
                'id' => $plan->id,
                'cable_network_id' => $plan->cable_network_id,
                'provider' => $plan->cableProvider?->name,
                'package_name' => $plan->package_name,
                'amount' => (float) $plan->amount,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $plans,
        ]);
    });

    Route::get('/electricity/discos', function () {
        return response()->json([
            'status' => 'success',
            'data' => ElectricityDistributor::where('active', 1)->get(['id', 'name']),
        ]);
    });

    Route::get('/exam_types', function () {
        return response()->json([
            'status' => 'success',
            'data' => ExamType::where('active', 1)->get(['id', 'name', 'amount']),
        ]);
    });

    // Airtime Purchase Routes
    Route::post('/topup/{id}', [BuyAirtimeController::class, 'storeApi']);
    Route::post('/topup', [BuyAirtimeController::class, 'storeApi']);
    Route::post('/airtime', [BuyAirtimeController::class, 'storeApi']);

    // Data Purchase Route
    Route::post('/data', [BuyDataController::class, 'storeApi']);

    // Cable TV Subscription Routes
    Route::post('/cable_subscription_payments', [CableSubscriptionController::class, 'storeApi']);
    Route::post('/cable', [CableSubscriptionController::class, 'storeApi']);
    Route::post('/cable/validate', [CableSubscriptionController::class, 'validateIcu']);

    // Electricity Bill Payment Routes
    Route::post('/electricity_bill_payments', [ElectricityBillController::class, 'storeApi']);
    Route::post('/electricity', [ElectricityBillController::class, 'storeApi']);
    Route::post('/validate_meter', [ElectricityBillController::class, 'validateMeter']);

    // Exam PIN Purchase Routes
    Route::post('/kirani', [ResultCheckerController::class, 'storeApi']);
    Route::post('/exam_pin', [ResultCheckerController::class, 'storeApi']);
    Route::post('/result_checker', [ResultCheckerController::class, 'storeApi']);

    // Transaction Status Routes (Authenticated)
    Route::post('/transaction/get-by-reference', [TransactionController::class, 'getByReference']);

    // Identity Verification (NIN & BVN)
    Route::get('/kyc/pricing', [VerificationApiController::class, 'pricing']);
    Route::post('/kyc/nin', [VerificationApiController::class, 'verifyNin']);
    Route::post('/kyc/bvn', [VerificationApiController::class, 'verifyBvn']);
});

// Public transaction status check (by reference ID)
Route::get('/transaction/status/{referenceId}', [TransactionController::class, 'status']);
