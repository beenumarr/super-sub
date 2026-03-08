<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\User\AirtimeToCashController;
use App\Http\Controllers\User\WalletFundingController;
use App\Http\Controllers\Admin\AppConfigurationController;
use App\Http\Controllers\Admin\AirtimeToCashServicesController;
use App\Http\Controllers\Admin\StaffController;


Route::middleware('auth')->group(function () {


    Route::get('/airtime_to_cash', [AirtimeToCashController::class, 'index'])->name('airtime_to_cash');
    Route::post('/airtime_to_cash/otp', [AirtimeToCashController::class, 'requestOtp'])->name('airtime_to_cash.otp');
    Route::post('/airtime_to_cash/verify-otp', [AirtimeToCashController::class, 'verifyOtp'])->name('airtime_to_cash.verify-otp');
    Route::post('/airtime_to_cash/send', [AirtimeToCashController::class, 'send'])->name('airtime_to_cash.send');
    Route::post('/airtime_to_cash/manual-send', [AirtimeToCashController::class, 'manualMethod'])->name('airtime_to_cash.manual-send');
    Route::get('/airtime_to_cash/transaction/{transaction}', [AirtimeToCashController::class, 'show'])->name('airtime_to_cash.transaction');
    Route::post('/airtime_to_cash/transfer-to-wallet', [WalletFundingController::class, 'transferToWallet'])->name('airtime_to_cash.transfer-to-wallet');


});


Route::middleware(['auth','admin'])->prefix('admin')->group(function () {



    Route::put('airtime_to_cash_services', [AirtimeToCashServicesController::class, 'updateNetworkSettings'])->name('airtime_to_cash_services.update');
    Route::get('airtime2cash-settings', [AirtimeToCashServicesController::class, 'settings'])->name('admin.airtime2cash.settings');
    Route::post('config/update', [AppConfigurationController::class, 'apiUpdate'])->name('admin.config.update');
    Route::resource('roles', RoleController::class);
    Route::resource('staffs', StaffController::class);

});

