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

            // Create relative symlink if supported
            if (! file_exists($publicStorage) && ! is_link($publicStorage)) {
                if (function_exists('symlink')) {
                    @symlink('../storage/app/public', $publicStorage);
                }
            }

            // Use artisan storage:link as fallback if symlink was not created
            if (! file_exists($publicStorage) && ! is_link($publicStorage)) {
                Artisan::call('storage:link');
                $storageOutput = Artisan::output();
            } else {
                $target = is_link($publicStorage) ? @readlink($publicStorage) : (is_dir($publicStorage) ? 'directory' : 'unknown');
                $storageOutput = 'Storage symlink active: ' . $target;
            }

            // If symlinks are completely disallowed on host, mirror uploads to public/storage/uploads
            if (is_dir($publicStorage) && ! is_link($publicStorage)) {
                @\Illuminate\Support\Facades\File::copyDirectory($appUploads, $publicStorage . '/uploads');
            }
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
