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

// Health check / API status route
Route::get('/', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'SuperSub API is online',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// App configuration (Public for theme colors & logo)
Route::get('/app-config', function () {
    $logo = \App\Models\AppConfiguration::where('key', 'site_logo')->first()?->value;
    $logoUrl = null;
    if ($logo) {
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists("uploads/" . $logo)) {
            $logoUrl = url(\Illuminate\Support\Facades\Storage::url("uploads/" . $logo));
        } else {
            $logoUrl = asset('images/' . $logo);
        }
    } else {
        $logoUrl = asset('images/logo.png');
    }

    $primary = \App\Models\AppConfiguration::where('key', 'site_primary_color')->first()?->value ?? config('settings.site_primary_color', '#9483EF');
    $secondary = \App\Models\AppConfiguration::where('key', 'site_secondary_color')->first()?->value ?? config('settings.site_secondary_color', '#8B5CF6');
    $siteName = \App\Models\AppConfiguration::where('key', 'site_name')->first()?->value ?? config('settings.site_name', config('app.name', 'SuperSub'));
    $isWalletTransferEnabled = in_array(
        \App\Models\AppConfiguration::where('key', 'feat_enable_wallet_transfer')->first()?->value ?? config('settings.feat_enable_wallet_transfer', '1'),
        ['1', 1, 'true', true],
        false
    );
    $isReferralEnabled = in_array(
        \App\Models\AppConfiguration::where('key', 'feat_enable_referral')->first()?->value ?? config('settings.feat_enable_referral', '1'),
        ['1', 1, 'true', true],
        false
    );

    return response()->json([
        'status' => 'success',
        'data' => [
            'site_name' => $siteName,
            'site_primary_color' => $primary,
            'site_secondary_color' => $secondary,
            'site_logo' => $logoUrl,
            'enable_wallet_transfer' => (bool) $isWalletTransferEnabled,
            'enable_referral' => (bool) $isReferralEnabled,
        ],
    ]);
});

// Public mobile authentication routes
Route::post('/auth/login', [\App\Http\Controllers\Api\AuthApiController::class, 'login']);
Route::post('/auth/register', [\App\Http\Controllers\Api\AuthApiController::class, 'register']);
Route::post('/auth/forgot-password', [\App\Http\Controllers\Api\AuthApiController::class, 'forgotPassword']);

// Protected routes requiring authentication
Route::middleware([ApiAuthenticate::class, 'auth:sanctum'])->group(function () {
    // Dashboard & User Profile
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
    Route::get('/user', [\App\Http\Controllers\Api\AuthApiController::class, 'user']);
    Route::post('/auth/logout', [\App\Http\Controllers\Api\AuthApiController::class, 'logout']);
    Route::post('/auth/verify-pin', [\App\Http\Controllers\Api\AuthApiController::class, 'verifyPin']);
    Route::post('/auth/email/verification-notification', [\App\Http\Controllers\Api\AuthApiController::class, 'sendVerificationEmail']);
    Route::post('/settings/pin', [\App\Http\Controllers\Api\AuthApiController::class, 'updatePin']);
    Route::post('/settings/password', [\App\Http\Controllers\Api\AuthApiController::class, 'updatePassword']);
    Route::post('/settings/profile', [\App\Http\Controllers\Api\AuthApiController::class, 'updateProfile']);
    Route::delete('/settings/account', [\App\Http\Controllers\Api\AuthApiController::class, 'deleteAccount']);
    Route::post('/settings/account/delete', [\App\Http\Controllers\Api\AuthApiController::class, 'deleteAccount']);

    // Bonus & Referrals
    Route::post('/wallet/withdraw-bonus', [\App\Http\Controllers\Api\UserApiController::class, 'withdrawBonus']);
    Route::get('/referrals', [\App\Http\Controllers\Api\UserApiController::class, 'getReferrals']);

    // KYC Tier Upgrades
    Route::post('/kyc/upgrade/bvn', [\App\Http\Controllers\Api\UserApiController::class, 'upgradeKycBvn']);
    Route::post('/kyc/upgrade/nin', [\App\Http\Controllers\Api\UserApiController::class, 'upgradeKycNin']);

    // Airtime to Cash
    Route::get('/airtime-to-cash/config', [\App\Http\Controllers\Api\UserApiController::class, 'getAirtimeToCashConfig']);
    Route::post('/airtime-to-cash/submit', [\App\Http\Controllers\Api\UserApiController::class, 'submitAirtimeToCash']);

    // Push Notification Device Token
    Route::post('/user/fcm-token', function (Request $request) {
        $request->validate([
            'token' => 'required|string|max:500',
            'device_type' => 'nullable|string|in:android,ios,web',
        ]);
        $user = $request->user();
        \App\Models\DeviceToken::updateOrCreate(
            ['token' => $request->token],
            [
                'user_id' => $user->id,
                'device_type' => $request->input('device_type', 'android'),
            ]
        );
        return response()->json([
            'status' => 'success',
            'message' => 'Device token registered successfully',
        ]);
    });

    Route::post('/user/fcm-token/delete', function (Request $request) {
        $request->validate(['token' => 'required|string']);
        \App\Models\DeviceToken::where('token', $request->token)->delete();
        return response()->json([
            'status' => 'success',
            'message' => 'Device token removed successfully',
        ]);
    });

    // Wallet & Funding Routes
    Route::get('/funding', [\App\Http\Controllers\User\WalletFundingController::class, 'index']);
    Route::get('/wallet/funding-accounts', [\App\Http\Controllers\User\WalletFundingController::class, 'index']);
    Route::post('/refresh_funding_accounts', [\App\Http\Controllers\User\WalletFundingController::class, 'refreshAccounts']);
    Route::post('/wallet/refresh-accounts', [\App\Http\Controllers\User\WalletFundingController::class, 'refreshAccounts']);
    Route::post('/promotions/redeem', [\App\Http\Controllers\User\PromotionRedemptionController::class, 'redeem']);
    Route::post('/fund-account', [\App\Http\Controllers\User\WalletTransferController::class, 'store']);
    Route::post('/wallet/transfer', [\App\Http\Controllers\User\WalletTransferController::class, 'store']);
    Route::post('/fund-account/validate-user', [\App\Http\Controllers\User\WalletTransferController::class, 'validateUser']);
    Route::post('/wallet/validate-user', [\App\Http\Controllers\User\WalletTransferController::class, 'validateUser']);

    // Transactions History
    Route::get('/transactions', [TransactionController::class, 'index']);

    // Network & Catalog Lookup Routes
    Route::get('/networks', function () {
        return response()->json([
            'status' => 'success',
            'data' => MobileNetwork::whereNotIn('name', ['KIRANI', 'SMILE'])
                ->get(['id', 'name', 'code', 'data_active', 'airtime_active']),
        ]);
    });

    Route::get('/data/plans', [BuyDataController::class, 'dataPlans']);
    Route::get('/data-plans', [BuyDataController::class, 'dataPlans']);

    Route::get('/cable/networks', function () {
        return response()->json([
            'status' => 'success',
            'data' => CableNetwork::where('active', 1)->get(['id', 'name', 'code', 'active']),
        ]);
    });

    Route::get('/cable/plans', function (Request $request) {
        $query = CableSubscriptionPlan::with('cableProvider');
        if ($request->filled('cable_network_id')) {
            $query->where('cable_network_id', $request->cable_network_id);
        }
        $plans = $query->get()->map(function ($plan) {
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

    Route::get('/electricity/distributors', function () {
        return response()->json([
            'status' => 'success',
            'data' => ElectricityDistributor::where('active', 1)->get(['id', 'name', 'code', 'active']),
        ]);
    });

    Route::get('/electricity/discos', function () {
        return response()->json([
            'status' => 'success',
            'data' => ElectricityDistributor::where('active', 1)->get(['id', 'name', 'code', 'active']),
        ]);
    });

    Route::get('/result-checker/exams', function () {
        return response()->json([
            'status' => 'success',
            'data' => ExamType::where('active', 1)->get(['id', 'name', 'amount', 'active']),
        ]);
    });

    Route::get('/exam_types', function () {
        return response()->json([
            'status' => 'success',
            'data' => ExamType::where('active', 1)->get(['id', 'name', 'amount', 'active']),
        ]);
    });

    // Airtime Purchase Routes
    Route::post('/topup/{id}', [BuyAirtimeController::class, 'storeApi']);
    Route::post('/topup', [BuyAirtimeController::class, 'storeApi']);
    Route::post('/airtime', [BuyAirtimeController::class, 'storeApi']);

    // Data Purchase Route
    Route::post('/data', [BuyDataController::class, 'storeApi']);
    Route::post('/data/buy', [BuyDataController::class, 'storeApi']);

    // Cable TV Subscription Routes
    Route::post('/cable_subscription_payments', [CableSubscriptionController::class, 'storeApi']);
    Route::post('/cable', [CableSubscriptionController::class, 'storeApi']);
    Route::post('/cable/subscribe', [CableSubscriptionController::class, 'storeApi']);
    Route::post('/cable/validate', [CableSubscriptionController::class, 'validateIcu']);
    Route::get('/cable/validate', [CableSubscriptionController::class, 'validateIcu']);
    Route::get('/validate_icu', [CableSubscriptionController::class, 'validateIcu']);

    // Electricity Bill Payment Routes
    Route::post('/electricity_bill_payments', [ElectricityBillController::class, 'storeApi']);
    Route::post('/electricity', [ElectricityBillController::class, 'storeApi']);
    Route::post('/electricity/pay', [ElectricityBillController::class, 'storeApi']);
    Route::post('/validate_meter', [ElectricityBillController::class, 'validateMeter']);
    Route::get('/validate_meter', [ElectricityBillController::class, 'validateMeter']);
    Route::post('/electricity/validate', [ElectricityBillController::class, 'validateMeter']);
    Route::get('/electricity/validate', [ElectricityBillController::class, 'validateMeter']);

    // Exam PIN Purchase Routes
    Route::post('/kirani', [ResultCheckerController::class, 'storeApi']);
    Route::post('/exam_pin', [ResultCheckerController::class, 'storeApi']);
    Route::post('/result_checker', [ResultCheckerController::class, 'storeApi']);
    Route::post('/result-checker/buy', [ResultCheckerController::class, 'storeApi']);

    // Transaction Status Routes (Authenticated)
    Route::post('/transaction/get-by-reference', [TransactionController::class, 'getByReference']);

    // Identity Verification (NIN & BVN)
    Route::get('/kyc/pricing', [VerificationApiController::class, 'pricing']);
    Route::post('/kyc/nin', [VerificationApiController::class, 'verifyNin']);
    Route::post('/kyc/bvn', [VerificationApiController::class, 'verifyBvn']);
});

// Public transaction status check (by reference ID)
Route::get('/transaction/status/{referenceId}', [TransactionController::class, 'status']);
