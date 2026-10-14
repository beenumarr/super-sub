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

        // Ensure public storage directory exists and symlink is properly linked
        $storageOutput = '';
        try {
            $publicStorage = public_path('storage');
            $appPublic = storage_path('app/public');
            $appUploads = storage_path('app/public/uploads');

            if (! file_exists($appPublic)) {
                @mkdir($appPublic, 0775, true);
            }
            if (! file_exists($appUploads)) {
                @mkdir($appUploads, 0775, true);
            }

            // If public/storage is a real directory blocking symlink creation, mirror files and remove it
            if (is_dir($publicStorage) && ! is_link($publicStorage)) {
                if (file_exists($publicStorage . '/uploads')) {
                    @\Illuminate\Support\Facades\File::copyDirectory($publicStorage . '/uploads', $appUploads);
                }
                @\Illuminate\Support\Facades\File::deleteDirectory($publicStorage);
            } elseif (is_link($publicStorage)) {
                // If existing symlink is broken or points to wrong path, unlink it to recreate
                @unlink($publicStorage);
            }

            // Create symlink if symlink function is enabled on the host
            if (function_exists('symlink')) {
                if (! file_exists($publicStorage) && ! is_link($publicStorage)) {
                    @symlink('../storage/app/public', $publicStorage);
                }
                if (! file_exists($publicStorage) && ! is_link($publicStorage)) {
                    try {
                        Artisan::call('storage:link');
                        $storageOutput = Artisan::output();
                    } catch (\Throwable $e) {
                        $storageOutput = 'Artisan storage:link notice: '.$e->getMessage();
                    }
                }
            }

            if (is_link($publicStorage)) {
                $storageOutput = 'Storage symlink active: '.@readlink($publicStorage);
            } else {
                // Host does not permit symlinks; maintain direct public storage directory
                $publicUploads = public_path('storage/uploads');
                if (! file_exists($publicUploads)) {
                    @mkdir($publicUploads, 0775, true);
                }
                if (file_exists($appUploads)) {
                    @\Illuminate\Support\Facades\File::copyDirectory($appUploads, $publicUploads);
                }
                $storageOutput = 'Storage mirror active (symlinks disabled in host php.ini; serving via direct folder and route fallback).';
            }
        } catch (\Throwable $e) {
            $storageOutput = 'Storage link notice: '.$e->getMessage();
        }

        // Ensure Boltnet API is registered if table exists
        $apis = [];
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('transaction_apis')) {
                \App\Models\TransactionApi::firstOrCreate(
                    ['name' => 'Boltnet'],
                    [
                        'model' => 'APIs\\Boltnet\\',
                        'url' => 'https://boltnet.com.ng',
                        'mtn_service_id' => 1,
                        'airtel_service_id' => 2,
                        'glo_service_id' => 3,
                        'ninemobile_service_id' => 4,
                    ]
                );
                $apis = \App\Models\TransactionApi::pluck('name')->toArray();
            }
        } catch (\Throwable $e) {
            // Ignore
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
            'apis' => $apis,
        ]);
    }
}
