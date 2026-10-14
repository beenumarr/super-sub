<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class DeployMigrationController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        // Run database migrations
        Artisan::call('migrate', [
            '--force' => true,
        ]);
        $migrateOutput = Artisan::output();

        // Ensure public storage directory exists and create storage symlink
        $storageOutput = '';
        try {
            if (! file_exists(storage_path('app/public'))) {
                @mkdir(storage_path('app/public'), 0775, true);
            }

            Artisan::call('storage:link', [
                '--force' => true,
            ]);
            $storageOutput = Artisan::output();
        } catch (\Throwable $e) {
            $storageOutput = 'Storage link notice: '.$e->getMessage();
        }

        // Refresh optimizations
        Artisan::call('optimize:clear');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');
        $optimizeOutput = Artisan::output();

        return response()->json([
            'status' => 'success',
            'message' => 'Migrations, storage link and optimization completed successfully.',
            'migration_output' => trim($migrateOutput),
            'storage_output' => trim($storageOutput),
            'optimize_output' => trim($optimizeOutput),
        ]);
    }
}
