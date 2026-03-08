<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use App\Exports\UserExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

// class ExportUserJob implements ShouldQueue

class ExportUserJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;


    protected $filters;
    protected $user;
    protected $filename;

    /**
     * Create a new job instance.
     *
     * @param array $filters
     * @param int $userId
     */
    public function __construct(array $filters, $filename)
    {
        $this->filters = $filters;
        $this->filename = $filename;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        // Fetch the data for export
        $data = User::orderBy('updated_at', 'desc');

        $chunkSize = 1000;


        $collection = collect();

        $data->filter($this->filters)->chunk($chunkSize, function ($User) use ($collection) {
            $collection->push($User);
        });

        // Flatten the collection to have a single-dimensional array
        $flattenedData = $collection->flatten();

        // Create the export instance and store the file
        $export = new UserExport($flattenedData);

        // Construct the correct directory path using Storage facade
        $directoryPath = 'exports';
        $filePath = $directoryPath . DIRECTORY_SEPARATOR . $this->filename.'.xlsx';

        // Ensure that the directory exists
        Storage::makeDirectory($directoryPath);


        Excel::store($export, $filePath);

        // Perform any additional post-export tasks if needed
    }
}
