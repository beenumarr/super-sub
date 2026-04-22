<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminImpersonateController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\BillPaymentServicesController;
use App\Http\Controllers\Admin\CableSubscriptionPlanController;
use App\Http\Controllers\Admin\DataPlanController;
use App\Http\Controllers\Admin\KiraniController;
use App\Http\Controllers\Admin\ManualFundingController;
use App\Http\Controllers\Admin\ServiceDiscountController;
use App\Http\Controllers\Admin\UserCategoryController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WalletFundingServicesController;
use App\Http\Controllers\Utils\ExportController;
use App\Http\Middleware\Admin;
use Illuminate\Support\Facades\Route;

// The following controllers are referenced in routes below and must be imported:
use App\Http\Controllers\Admin\AdminTransactionController;
use App\Http\Controllers\Admin\A2CTransactionController;
use App\Http\Controllers\Admin\ServiceCardController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\AppConfigurationController;
use App\Http\Controllers\Admin\PromoController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\ServiceManagementController;
use App\Http\Controllers\Admin\DataPlanTypeController;
use App\Http\Controllers\Admin\MobileNetworkController;
use App\Http\Controllers\Admin\PackageController;
use App\Http\Controllers\Admin\TransactionApiController;
use App\Http\Controllers\Admin\CableTvServicesController;
use App\Http\Controllers\Admin\ResultCheckerServicesController;
use App\Http\Controllers\Admin\ServiceChargeController;
use App\Http\Controllers\Admin\SmileController;

Route::middleware(['auth', Admin::class])->prefix('admin')->group(function () {

    Route::put('users/{user}/custom-charges', [UserController::class, 'updateCustomCharges'])->name('admin.users.update-custom-charges');
    Route::get('users/plans/category/{categoryId}', [UserController::class, 'getPlansByCategory'])->name('admin.users.get-plans-by-category');
    Route::get('users/role/{role}', [UserController::class, 'byRole'])->name('admin.users.by-role');
    Route::post('/{user}/send_lba', [UserController::class, 'sendLowBalanceAlert'])->name('admin.users.send_lba');
    Route::get('/impersonate/{user}', [AdminImpersonateController::class, 'impersonate'])->name('admin.impersonate');

    // User categories
    Route::post('/user-categories', [UserCategoryController::class, 'store'])->name('admin.user-categories.store');
    Route::post('/user-categories/bulk-assign', [UserCategoryController::class, 'bulkAssign'])->name('admin.user-categories.bulk-assign');
    Route::get('/', [AdminDashboardController::class, 'index'])->name('admin.index');
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/analytics', [AnalyticsController::class, 'users'])->name('admin.analytics');
    Route::get('/analytics/users/{user}', [AnalyticsController::class, 'viewUser'])->name('admin.analytics.users.view');
    Route::post('/users/{user}/generate-api-key', [UserController::class, 'generateApiKey'])->name('admin.users.generate-api-key');
    Route::get('/manual-funding', [ManualFundingController::class, 'index'])->name('admin.manual-funding');
    Route::post('/manual-funding', [ManualFundingController::class, 'store'])->name('manual-funding.store');
    Route::get('/transactions', [AdminTransactionController::class, 'index'])->name('admin.transactions');
    Route::get('/a2c-transactions', [A2CTransactionController::class, 'index'])->name('admin.a2c-transactions');
    Route::get('/a2c-transactions/{transaction}', [A2CTransactionController::class, 'show'])->name('admin.a2c-transactions.show');
    Route::put('/a2c-transactions/update-status/{transaction}', [A2CTransactionController::class, 'update'])->name('admin.a2c-transactions.update');
    Route::post('/a2c-transactions/transfer-to-wallet/{transaction}', [A2CTransactionController::class, 'transferToWallet'])->name('admin.a2c-transactions.transfer-to-wallet');
    Route::get('/transactions/{transaction}', [AdminTransactionController::class, 'show'])->name('admin.transactions.show');
    Route::put('/transactions/{transaction}', [AdminTransactionController::class, 'update'])->name('admin.transactions.update');
    Route::post('/data_plans/bulk-action', [DataPlanController::class, 'bulkAction'])->name('data_plans.bulk-action');
    Route::resource('/data_plans', DataPlanController::class);
    Route::resource('/cable_subscription_plans', CableSubscriptionPlanController::class);
    Route::resource('/service-cards', ServiceCardController::class);
    Route::resource('users', UserController::class)->names('admin.users');
    Route::get('/users/view/{user}', [UserController::class, 'viewUser'])->name('admin.users.view');
    Route::post('/users/role/{user}', [StaffController::class, 'updateRole'])->name('admin.users.update-role');
    Route::resource('/staffs', StaffController::class)->only(['index', 'store', 'update', 'destroy'])->names([
        'index' => 'admin.staffs.index',
        'store' => 'admin.staffs.store',
        'update' => 'admin.staffs.update',
        'destroy' => 'admin.staffs.destroy',
    ]);
    Route::resource('/roles', RoleController::class)->only(['index', 'store', 'update', 'destroy', 'show'])->names([
        'index' => 'admin.roles.index',
        'store' => 'admin.roles.store',
        'update' => 'admin.roles.update',
        'destroy' => 'admin.roles.destroy',
        'show' => 'admin.roles.show',
    ]);
    Route::post('/users/delete-virtual-acacounts/{user}', [UserController::class, 'deleteVirtualAccount'])->name('admin.users.delete-virtual-accounts');
    Route::delete('/users/delete-kyc/{user}', [UserController::class, 'deleteKyc'])->name('admin.users.delete-kyc');
    Route::post('/users/generate-virtual-acacounts/{user}', [UserController::class, 'generateVirtualAccount'])->name('admin.users.generate-virtual-accounts');

    // App Configuration Routes - View operations
    Route::get('/app_configurations', [AppConfigurationController::class, 'index'])
        ->middleware('permission:view_site_configurations')
        ->name('app_configurations.index');
    Route::get('/app_configurations/{app_configuration}', [AppConfigurationController::class, 'show'])
        ->middleware('permission:view_site_configurations')
        ->name('app_configurations.show');

    // App Configuration Routes - Update operations
    Route::post('/app_configurations', [AppConfigurationController::class, 'store'])
        ->middleware('permission:update_site_configurations')
        ->name('app_configurations.store');
    Route::put('/app_configurations/{app_configuration}', [AppConfigurationController::class, 'update'])
        ->middleware('permission:update_site_configurations')
        ->name('app_configurations.update');
    Route::patch('/app_configurations/{app_configuration}', [AppConfigurationController::class, 'update'])
        ->middleware('permission:update_site_configurations')
        ->name('app_configurations.patch');
    Route::delete('/app_configurations/{app_configuration}', [AppConfigurationController::class, 'destroy'])
        ->middleware('permission:update_site_configurations')
        ->name('app_configurations.destroy');
    Route::get('/app_configurations/create', [AppConfigurationController::class, 'create'])
        ->middleware('permission:update_site_configurations')
        ->name('app_configurations.create');
    Route::get('/app_configurations/{app_configuration}/edit', [AppConfigurationController::class, 'edit'])
        ->middleware('permission:update_site_configurations')
        ->name('app_configurations.edit');

    Route::resource('/promo', PromoController::class);
    Route::post('/promotions', [PromotionController::class, 'store'])->name('admin.promotions.store');
    Route::put('/promotions/{promotion}/activate', [PromotionController::class, 'activate'])->name('admin.promotions.activate');
    Route::put('/promotions/{promotion}/deactivate', [PromotionController::class, 'deactivate'])->name('admin.promotions.deactivate');
    Route::delete('/promotions/{promotion}', [PromotionController::class, 'destroy'])->name('admin.promotions.destroy');
    Route::post('/update-site-images', [AppConfigurationController::class, 'updatePhotos'])->name('update-site-images');
    Route::post('/clear-images', [AppConfigurationController::class, 'clearImages'])->name('clear-images');
    Route::get('/services-management', [ServiceManagementController::class, 'index'])->name('services-management');
    Route::resource('/data_plan_types', DataPlanTypeController::class);
    Route::put('/data_plan_types/{data_plan_type}/toggle', [DataPlanTypeController::class, 'toggle'])->name('data_plan_types.toggle');
    Route::resource('/mobile_networks', MobileNetworkController::class)->only('show','update');
    Route::resource('/user_packages', PackageController::class)->only('index','show','update');
    Route::resource('/transaction_apis', TransactionApiController::class)->only('show','update', 'store');
    Route::resource('/cable_tv_services', CableTvServicesController::class)->only('index','update','show');
    Route::resource('/result_checker_services', ResultCheckerServicesController::class)->only('index','update','show');
    Route::resource('/bill_payment_services', BillPaymentServicesController::class)->only('index','update', 'show');
    Route::resource('/wallet_funding_services', WalletFundingServicesController::class)->only('index','update');
    Route::get('/service-discounts', [ServiceDiscountController::class, 'index'])->name('service-discounts');
    Route::put('/service-discounts/airtime', [ServiceDiscountController::class, 'airtime'])->name('service-discounts.airtime');
    Route::get('/service-charges', [ServiceChargeController::class, 'index'])->name('service-charges');
    Route::put('/service-charges/cable_tv', [ServiceChargeController::class, 'cableTv'])->name('service-charges.cable-tv');
    Route::put('/service-charges/bill_payment', [ServiceChargeController::class, 'billPayment'])->name('service-charges.bill-payment');
    Route::get('/kirani', [KiraniController::class, 'index'])->name('admin.kirani');
    Route::post('/kirani', [KiraniController::class, 'update'])->name('admin.kirani.update');
    Route::post('/kirani/refresh-balance', [KiraniController::class, 'refreshBalance'])->name('admin.kirani.refresh-balance');
    Route::get('/kirani/plans', [KiraniController::class, 'plans'])->name('admin.kirani.plans');
    Route::post('/kirani/plans', [KiraniController::class, 'storePlan'])->name('admin.kirani.plans.store');
    Route::put('/kirani/plans/{plan}', [KiraniController::class, 'updatePlan'])->name('admin.kirani.plans.update');
    Route::delete('/kirani/plans/{plan}', [KiraniController::class, 'destroyPlan'])->name('admin.kirani.plans.destroy');
    // Route::post('/exports/users', [ExportController::class, 'exportUsers'])->name('exports.users');
    // Route::post('/exports/user-analytics', [ExportController::class, 'exportUserAnalytics'])->name('exports.user-analytics');

    Route::get('/smile/plans', [SmileController::class, 'plans'])->name('admin.smile.plans');
    Route::post('/smile/plans', [SmileController::class, 'storePlan'])->name('admin.smile.plans.store');
    Route::put('/smile/plans/{plan}', [SmileController::class, 'updatePlan'])->name('admin.smile.plans.update');
    Route::delete('/smile/plans/{plan}', [SmileController::class, 'destroyPlan'])->name('admin.smile.plans.destroy');
});
