<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Models\AppConfiguration;
use Illuminate\Support\Facades\Log;

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


        $allFilesName = [];

        foreach ($this->allFilesId as $fileId) {
            $path = storage_path('uploads/' . $fileId);


            if($fileId === 'logo'){

                $fileName = $fileId . '.png';
                Image::make($path)->encode('png')->save();
                // make logo as png
                // make logo as favicon

            }else{

                $fileName = $fileId . '.jpg';
                Image::make($path)->encode('jpg')->save();

            };


            $allFilesName[] = $fileName;

            try {

                // Delete from the 'storage' file
                $storageDeleted = File::delete('images/' . $fileName);

                if (!$storageDeleted) {
                    Log::error("Failed to delete folder from 'storage' disk: images/{$fileId}");
                }

                // // Move the new version to the 'public' folder
                if (Storage::disk('public')->put('images/' . $fileName, fopen($path, 'r+'))) {
                    // Delete the temporary file from the 'storage' folder
                    File::delete($path);

                    // Update or create the configuration record
                    $config = AppConfiguration::updateOrCreate(
                        ['key' => $fileId],
                        ['value' => $fileName]
                    );
                } else {
                    Log::error("Failed to move file to 'public' disk: images/{$fileName}");
                }
            } catch (\Exception $e) {
                Log::error("An error occurred: {$e->getMessage()}");
            }
        }
    }
}
