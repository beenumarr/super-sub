<?php

use App\Http\Controllers\User\BuyAirtimeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;
use App\Http\Middleware\ApiAuthenticate;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public mobile authentication routes
Route::post('/auth/login', [\App\Http\Controllers\Api\AuthApiController::class, 'login']);
Route::post('/auth/register', [\App\Http\Controllers\Api\AuthApiController::class, 'register']);

// Protected routes requiring authentication
Route::middleware(ApiAuthenticate::class, 'auth:sanctum')->group(function () {
    Route::get('/user', [\App\Http\Controllers\Api\AuthApiController::class, 'user']);
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
    Route::post('/auth/logout', [\App\Http\Controllers\Api\AuthApiController::class, 'logout']);
    Route::post('/user/pin', [\App\Http\Controllers\Api\AuthApiController::class, 'updatePin']);

    // Airtime transaction routes
    Route::get('/buy_airtime', [\App\Http\Controllers\User\BuyAirtimeController::class, 'index']);
    Route::post('/buy_airtime', [\App\Http\Controllers\User\BuyAirtimeController::class, 'store']);
    Route::post('/topup/{id}', [BuyAirtimeController::class, 'storeApi']);
    Route::post('/topup', [BuyAirtimeController::class, 'storeApi']);
    Route::post('/airtime', [BuyAirtimeController::class, 'storeApi']);

    // Data transaction routes
    Route::get('/data-plans', [\App\Http\Controllers\User\BuyDataController::class, 'dataPlans']);
    Route::post('/buy_data', [\App\Http\Controllers\User\BuyDataController::class, 'store']);

    // Cable TV routes
    Route::get('/cable-networks', [\App\Http\Controllers\User\CableSubscriptionController::class, 'index']);
    Route::get('/validate_icu', [\App\Http\Controllers\User\CableSubscriptionController::class, 'validateIcu']);
    Route::get('/cable_subscriptions/filter_plans', [\App\Http\Controllers\User\CableSubscriptionController::class, 'filterPlans']);
    Route::post('/cable_subscriptions', [\App\Http\Controllers\User\CableSubscriptionController::class, 'store']);

    // Electricity bill routes
    Route::get('/electricity-distributors', [\App\Http\Controllers\User\ElectricityBillController::class, 'index']);
    Route::get('/validate_meter', [\App\Http\Controllers\User\ElectricityBillController::class, 'validateMeter']);
    Route::post('/electricity_bill_payments', [\App\Http\Controllers\User\ElectricityBillController::class, 'store']);

    // Transaction status routes (authenticated)
    Route::post('/transaction/get-by-reference', [TransactionController::class, 'getByReference']);

    // Identity Verification (NIN & BVN)
    Route::get('/kyc/pricing', [\App\Http\Controllers\Api\VerificationApiController::class, 'pricing']);
    Route::post('/kyc/nin', [\App\Http\Controllers\Api\VerificationApiController::class, 'verifyNin']);
    Route::post('/kyc/bvn', [\App\Http\Controllers\Api\VerificationApiController::class, 'verifyBvn']);
});



// Public transaction status check (no authentication required)
Route::get('/transaction/status/{referenceId}', [TransactionController::class, 'status']);

// Testing routes - these should ideally be removed in production
if (class_exists(App\Http\Controllers\ApiTestController::class)) {
    Route::prefix('test')->group(function () {
        Route::post('/generate-keys', [App\Http\Controllers\ApiTestController::class, 'generateKeys']);
        Route::post('/generate-signature', [App\Http\Controllers\ApiTestController::class, 'generateSignature']);
        Route::post('/verify-signature', [App\Http\Controllers\ApiTestController::class, 'verifySignature']);
    });
}
