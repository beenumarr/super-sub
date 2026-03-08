<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('user-settings', 'user-settings/profile');

    Route::get('developer', [ProfileController::class, 'developer'])->name('developer.index');
    Route::get('developer/api-key', [ProfileController::class, 'apiKey'])->name('developer.api');
    Route::post('devloper/apikey', [ProfileController::class, 'generateApiKey'])->name('developer.generate-key');
    Route::get('developer/webhook', [ProfileController::class, 'webhook'])->name('developer.webhook');
    Route::put('developer/webhook', [ProfileController::class, 'updateWebhook'])->name('developer.webhook.update');

    Route::get('user-settings/profile', [ProfileController::class, 'edit'])->name('user-settings.profile');
    // Route::delete('user-settings/profile', [ProfileController::class, 'destroy'])->name('user.settings.destroy');

    Route::get('user-settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('user-settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('user-settings/charges', [ProfileController::class, 'charges'])->name('user-settings.charges');

    Route::get('user-settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
