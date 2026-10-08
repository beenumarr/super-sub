<?php

use App\Http\Controllers\AccountStatusController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\SettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\User\BuyAirtimeController;
use App\Http\Controllers\User\BuyDataController;
use App\Http\Controllers\User\CableSubscriptionController;
use App\Http\Controllers\User\DeveloperApiController;
use App\Http\Controllers\User\ElectricityBillController;
use App\Http\Controllers\User\IdentityVerificationController;
use App\Http\Controllers\User\KiraniTransactionController;
use App\Http\Controllers\User\KycController;
use App\Http\Controllers\User\PromotionRedemptionController;
use App\Http\Controllers\User\ReferralController;
use App\Http\Controllers\User\ResultCheckerController;
use App\Http\Controllers\User\SmileTransactionController;
use App\Http\Controllers\User\WalletFundingController;
use App\Http\Controllers\User\WalletTransferController;
use App\Http\Controllers\WebHooks\BillStackWebhookController;
use App\Http\Controllers\WebHooks\PaymentpointWebhookController;
use App\Http\Controllers\WebHooks\PayvesselTransactionWebhookController;
use App\Http\Controllers\WebHooks\TransactionWebhookController;
use App\Http\Resources\AuthUserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware('auth')->group(function () {
    Route::match(['get', 'post'], '/impersonate/leave', [\App\Http\Controllers\Admin\AdminImpersonateController::class, 'leave'])->name('impersonate.leave');
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['verified'])->name('dashboard');
    Route::get('/funding', [WalletFundingController::class, 'index'])->name('funding');
    Route::post('/fund-account', [WalletTransferController::class, 'store'])->name('fund-account');
    Route::get('/fund-account', [WalletTransferController::class, 'index'])->name('fund-account.index');
    Route::post('/fund-account/validate-user', [WalletTransferController::class, 'validateUser'])->name('fund-account.validate-user');
    Route::post('/refresh_funding_accounts', [WalletFundingController::class, 'refreshAccounts'])->name('refresh_accounts');
    Route::post('/get_temp_accounts', [WalletFundingController::class, 'getTempAccount'])->name('get_temp_accounts');
    Route::get('/kyc', [KycController::class, 'index'])->name('kyc');
    Route::get('/kyc-details', [KycController::class, 'getKycDetails'])->name('kyc-details');
    Route::get('/kyc-bvn', [KycController::class, 'kycBvn'])->name('kyc.bvn')->middleware('kycCheck');
    Route::patch('/kyc-bvn', [KycController::class, 'updateKycBvn'])->name('update-kyc-bvn');
    Route::get('/kyc-nin', [KycController::class, 'kycNin'])->name('kyc.nin')->middleware('kycCheck');
    Route::patch('/kyc-nin', [KycController::class, 'updateKycNin'])->name('update-kyc-nin');
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions');
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
    // Buy data (use BuyDataController for both legacy and new TSX routes)
    Route::get('/buy_data', [BuyDataController::class, 'index'])->name('buy_data');
    Route::post('/buy_data', [BuyDataController::class, 'store'])->name('buy_data.store')->middleware(['throttle:30,1']);
    Route::get('/data-plans', [BuyDataController::class, 'dataPlans']);
    Route::get('/buy_data/filter_data_plan_types', [BuyDataController::class, 'filterDataPlanType']);
    Route::get('/buy_data/filter_data_plans', [BuyDataController::class, 'filterDataPlan']);



    Route::get('/result_checker', [ResultCheckerController::class, 'index'])->name('result_checker');
    Route::post('/result_checker', [ResultCheckerController::class, 'store'])->name('result_checker.store');
    Route::get('/verification', [IdentityVerificationController::class, 'index'])->name('verification.index');
    Route::post('/verification/nin', [IdentityVerificationController::class, 'verifyNin'])->name('verification.nin')->middleware(['throttle:30,1']);
    Route::post('/verification/bvn', [IdentityVerificationController::class, 'verifyBvn'])->name('verification.bvn')->middleware(['throttle:30,1']);
    Route::resource('/cable_subscriptions', CableSubscriptionController::class)->except(['show','edit']);
    Route::get('/validate_icu', [CableSubscriptionController::class, 'validateIcu'])->name('validate_icu');
    Route::get('/cable_subscriptions/filter_plans', [CableSubscriptionController::class, 'filterPlans']);
    Route::get('/cable-networks', [CableSubscriptionController::class, 'index']);
    Route::resource('/electricity_bill_payments', ElectricityBillController::class)->except(['show','edit'])->middleware(['throttle:30,1']);
    Route::get('/validate_meter', [ElectricityBillController::class, 'validateMeter'])->name('validate_meter');
    Route::get('/electricity-distributors', [ElectricityBillController::class, 'index']);
    Route::get('/kirani', [KiraniTransactionController::class, 'index'])->name('kirani.index');
    Route::post('/kirani', [KiraniTransactionController::class, 'store'])->name('kirani.store')->middleware(['throttle:30,1']);
    Route::get('/kirani/validate', [KiraniTransactionController::class, 'validateNumber'])->name('kirani.validate');
    Route::get('/kirani/plans', [KiraniTransactionController::class, 'filterPlans'])->name('kirani.plans');
    Route::get('/smile', [SmileTransactionController::class, 'index'])->name('smile.index');
    Route::post('/smile', [SmileTransactionController::class, 'store'])->name('smile.store')->middleware(['throttle:30,1']);
    Route::get('/smile/validate', [SmileTransactionController::class, 'validateNumber'])->name('smile.validate');
    Route::get('/smile/plans', [SmileTransactionController::class, 'filterPlans'])->name('smile.plans');
    Route::get('/buy_airtime', [BuyAirtimeController::class, 'index'])->name('buy_airtime');
    Route::post('/buy_airtime', [BuyAirtimeController::class, 'store'])->name('buy_airtime.store')->middleware(['throttle:30,1']);;
    Route::get('/developer', [DeveloperApiController::class, 'index'])->name('developer.index');
    Route::get('/api-documentation', [DeveloperApiController::class, 'docs'])->name('api-documentation');
    Route::get('/developer/api-documentation', [DeveloperApiController::class, 'docs'])->name('developer.documentation');
    Route::post('/developer/generate-api-token', [DeveloperApiController::class, 'generateApiToken'])->name('developer.generate-api-token');
    Route::get('/referrals', [ReferralController::class, 'index'])->name('referrals.index');
    Route::post('/withdraw-bonus', [ReferralController::class, 'withdrawBonus'])->name('withdraw-bonus');
    Route::put('/claim-referral-bonus/{referral}', [ReferralController::class, 'claimReferralBonus'])->name('claim-referral-bonus');
    Route::post('/promotions/redeem', [PromotionRedemptionController::class, 'redeem'])->name('promotions.redeem');
    Route::get('/comin-soon', function () {return Inertia::render('Utils/CominSoon');})->name('coming-soon');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::patch('/profile/update-bank-account', [ProfileController::class, 'updateBankAccount'])->name('profile.update-bank-account');
    Route::get('/user_search', [UserController::class, 'search'])->name('users.search');
    Route::post('/profile/verify-bank-account', [ProfileController::class, 'verifyBankAccount'])
        ->name('profile.verify-bank-account');

});




Route::get('/', function () {
    return redirect()->route('login');
})->name('home');
Route::get('/privacy-and-terms', [LandingPageController::class, 'privacyPage']);
Route::get('/info', [LandingPageController::class, 'info']);
Route::post('/monnify/transaction-completion', [TransactionWebhookController::class, 'handleTransactionCompletion']);
Route::post('/payvessel/transaction-completion', [PayvesselTransactionWebhookController::class, 'handleTransactionCompletion']);
Route::post('/paymentpoint/transaction-completion', [PaymentpointWebhookController::class, 'handleTransactionCompletion']);
Route::post('/billStack/transaction-completion', [BillStackWebhookController::class,  'handlePaymentWebhook']);

Route::middleware(['auth'])->group(function () {
    Route::get('/account/deactivated', [AccountStatusController::class, 'deactivated'])->name('account.deactivated');
});


Route::get('/privacy-policy', function () {
    $siteName = \App\Models\AppConfiguration::where('key', 'site_name')->first()?->value
        ?? config('settings.site_name', config('app.name', 'SuperSub'));
    return view('privacy_policy', compact('siteName'));
})->name('privacy-policy');

Route::get('/terms-of-use', function () {
    return Inertia::render('legal/terms-of-use');
})->name('terms-of-use');

// Public Account Deletion Request routes (Google Play compliance)
Route::get('/account-deletion', [\App\Http\Controllers\AccountDeletionController::class, 'index'])->name('account-deletion.index');
Route::post('/account-deletion', [\App\Http\Controllers\AccountDeletionController::class, 'submit'])->name('account-deletion.submit');
Route::get('/delete-account', [\App\Http\Controllers\AccountDeletionController::class, 'index'])->name('delete-account');




Route::middleware('auth:sanctum')->get('/api2/user', function (Request $request) {
    return response(new AuthUserResource($request->user()));
});

require __DIR__.'/admin.php';
require __DIR__.'/auth.php';
require __DIR__.'/utils.php';
require __DIR__.'/feat.php';
require __DIR__.'/settings.php';



