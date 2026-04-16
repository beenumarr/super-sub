<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Models\AppConfiguration;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class ImageUpload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public $allFilesId;

    /**
     * Create a new job instance.
     */
    public function __construct($allFilesId)
    {
        $this->allFilesId = $allFilesId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Ensure public uploads directory exists
            $publicUploadsPath = storage_path('app/public/uploads');
            if (!File::isDirectory($publicUploadsPath)) {
                File::makeDirectory($publicUploadsPath, 0755, true, true);
            }

            foreach ($this->allFilesId as $fileId) {
                $fileMeta = is_array($fileId) ? $fileId : null;
                $logicalId = is_array($fileId) ? ($fileId['id'] ?? null) : $fileId;
                $ext = is_array($fileId) ? ($fileId['ext'] ?? null) : null;

                if (!is_string($logicalId) || $logicalId === '') {
                    Log::error('Invalid file id in ImageUpload job payload');
                    continue;
                }

                // Backward-compatible temp filename support
                $tempFileName = $logicalId;
                if (is_string($ext) && $ext !== '') {
                    $tempFileName = "{$logicalId}.{$ext}";
                }

                $tempPath = storage_path('uploads/' . $tempFileName);

                // Validate temp file exists
                if (!File::exists($tempPath)) {
                    Log::error("Temp file not found: {$tempPath}");
                    continue;
                }

                try {
                    // Determine output filename (preserve extension when provided)
                    if (is_string($ext) && $ext !== '') {
                        $fileName = "{$logicalId}.{$ext}";
                    } elseif ($logicalId === 'logo') {
                        $fileName = 'logo.png';
                    } elseif ($logicalId === 'favicon') {
                        $fileName = 'favicon.png';
                    } else {
                        $fileName = $logicalId . '.jpg';
                    }

                    $publicPath = storage_path('app/public/uploads/' . $fileName);

                    // Copy file directly to public uploads directory
                    if (File::copy($tempPath, $publicPath)) {
                        Log::info("File processed successfully: {$logicalId} -> {$fileName}");

                        // Determine the config key to update
                        if ($logicalId === 'logo') {
                            $configKey = 'site_logo';
                        } elseif ($logicalId === 'favicon') {
                            $configKey = 'site_favicon';
                        } else {
                            $configKey = $logicalId;
                        }

                        // Update configuration with the filename
                        AppConfiguration::updateOrCreate(
                            ['key' => $configKey],
                            ['value' => $fileName]
                        );

                        // Clear the settings cache so new values are picked up
                        Cache::forget('app_settings');
                    } else {
                        Log::error("Failed to copy file: {$fileId}");
                        continue;
                    }

                    // Clean up temporary file
                    if (File::exists($tempPath)) {
                        File::delete($tempPath);
                    }

                } catch (\Exception $e) {
                    Log::error("Error processing file {$logicalId}: {$e->getMessage()}");
                    continue;
                }
            }
        } catch (\Exception $e) {
            Log::error("Image upload job error: {$e->getMessage()}");
        }
    }
}
