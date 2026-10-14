<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class DeployMigrationController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        // Run database migrations and seeders
        Artisan::call('migrate', [
            '--force' => true,
            '--seed' => true,
        ]);
        $migrateOutput = Artisan::output();

        // Refresh optimizations
        Artisan::call('optimize:clear');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');
        $optimizeOutput = Artisan::output();

        return response()->json([
            'status' => 'success',
            'message' => 'Migrations, seeds and optimization completed successfully.',
            'migration_output' => trim($migrateOutput),
            'optimize_output' => trim($optimizeOutput),
        ]);
    }
}
