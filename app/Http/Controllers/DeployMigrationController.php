<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class DeployMigrationController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $token = $request->header('X-Deploy-Token') ?? $request->input('token') ?? $request->query('token');

        $validTokens = array_filter([
            env('DEPLOY_SECRET'),
            config('app.key'),
            config('app.key') ? hash('sha256', (string) config('app.key')) : null,
            env('APP_KEY'),
            env('FTP_PASSWORD'),
        ]);

        $authenticated = false;
        foreach ($validTokens as $expected) {
            if (!empty($token) && hash_equals((string) $expected, (string) $token)) {
                $authenticated = true;
                break;
            }
        }

        if (!$authenticated) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: Invalid or missing token.',
            ], 403);
        }

        // Run database migrations
        Artisan::call('migrate', ['--force' => true]);
        $migrateOutput = Artisan::output();

        // Refresh optimizations
        Artisan::call('optimize:clear');
        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');
        $optimizeOutput = Artisan::output();

        return response()->json([
            'status' => 'success',
            'message' => 'Migrations and optimization completed successfully.',
            'migration_output' => trim($migrateOutput),
            'optimize_output' => trim($optimizeOutput),
        ]);
    }
}
