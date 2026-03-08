
<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\MigrationController;

Route::get('/clear-cache', function() {
    Artisan::call('cache:clear');
    Artisan::call('config:cache');
    Artisan::call('route:clear');
    Artisan::call('route:cache');
    $output = Artisan::output();
    return response()->json(['message' => 'Cache cleared successfully', 'output' => $output]);
})->middleware('update');

Route::get('/run-migration-seed', function() {
    Artisan::call('migrate --seed');
    $output = Artisan::output();
    return response()->json(['message' => 'Migration and seed run successfully', 'output' => $output]);
})->middleware('update');

Route::get('/run-migration', [MigrationController::class, 'runSpecificMigrations'])->middleware('update');

Route::get('/refresh-database___1', function() {
    Artisan::call('database:refresh');
    $output = Artisan::output();
    return response()->json(['message' => 'Database refreshed successfully', 'output' => $output]);
})->middleware('update');
