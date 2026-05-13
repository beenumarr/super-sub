<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\PinController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('user-settings', 'user-settings/profile');

    Route::get('developer', [ProfileController::class, 'developer'])->name('developer.index');
    Route::get('developer/api-key', [ProfileController::class, 'apiKey'])->name('developer.api');
    Route::post('developer/api-key', [ProfileController::class, 'generateApiKey'])->name('developer.generate-key');
    Route::get('developer/webhook', [ProfileController::class, 'webhook'])->name('developer.webhook');
    Route::put('developer/webhook', [ProfileController::class, 'updateWebhook'])->name('developer.webhook.update');

    Route::get('user-settings/profile', [ProfileController::class, 'edit'])->name('user-settings.profile');
    // Route::delete('user-settings/profile', [ProfileController::class, 'destroy'])->name('user.settings.destroy');

    Route::get('user-settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('user-settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('user-settings/charges', [ProfileController::class, 'charges'])->name('user-settings.charges');

    Route::get('user-settings/pin', [PinController::class, 'edit'])->name('user-settings.pin');
    Route::put('user-settings/pin', [PinController::class, 'update'])->name('pin.update');

    Route::get('user-settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
