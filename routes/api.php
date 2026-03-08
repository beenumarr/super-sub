<?php

use App\Http\Controllers\AirtimeTransactionController;
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

// Protected routes requiring authentication
Route::middleware(ApiAuthenticate::class, 'auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
            'message' => 'API test successful'
        ]);
    });

    // Data transaction routes (disabled: legacy DataTransactionController removed)
    Route::post('/topup/{id}', [AirtimeTransactionController::class, 'purchase']);
    Route::post('/topup', [AirtimeTransactionController::class, 'purchase']);
    Route::post('/airtime', [AirtimeTransactionController::class, 'purchase']);

    // Transaction status routes (authenticated)
    Route::post('/transaction/get-by-reference', [TransactionController::class, 'getByReference']);
});



// Public transaction status check (no authentication required)
Route::get('/transaction/status/{referenceId}', [TransactionController::class, 'status']);

// Testing routes - these should ideally be removed in production
Route::prefix('test')->group(function () {
    Route::post('/generate-keys', [App\Http\Controllers\ApiTestController::class, 'generateKeys']);
    Route::post('/generate-signature', [App\Http\Controllers\ApiTestController::class, 'generateSignature']);
    Route::post('/verify-signature', [App\Http\Controllers\ApiTestController::class, 'verifySignature']);
});
