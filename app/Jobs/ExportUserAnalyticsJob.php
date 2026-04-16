<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use App\Exports\UserAnalyticExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

// class ExportUserJob implements ShouldQueue

class ExportUserAnalyticsJob implements ShouldQueue
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
        // Total Wallet Fund Sum and Count
        $totalFund = Transaction::select('user_id', DB::raw('SUM(amount) as total_amount'), DB::raw('COUNT(*) as total_count'))
        ->where('type', 'WALLET')
        ->where('status', 'SUCCESS')
        ->where('metadata->ledger_type', 'credit')
        ->groupBy('user_id');


        // Total Spend Sum
        $totalSpend = Transaction::select('user_id', DB::raw('SUM(amount) as total_amount'), DB::raw('COUNT(*) as total_count'))
        ->where('status', 'SUCCESS')
        ->whereNotIn('type', ['WALLET', 'BONUS_WALLET'])
        ->groupBy('user_id');


        $data = User::select(
            'users.id',
            'users.name',
            'users.phone',
            'users.referal_username',
            'users.last_login',
            'users.email',
            'transaction_sum_count.total_amount as total_spending',
            'transaction_sum_count.total_count as transaction_count',
            'total_funding.total_amount as total_funding',
            'total_funding.total_count as wallet_funding_count'
        )->with('wallet:id,user_id,balance')
        ->leftJoinSub($totalFund, 'total_funding', function ($join) {
            $join->on('users.id', '=', 'total_funding.user_id');
        })
        ->leftJoinSub($totalSpend, 'transaction_sum_count', function ($join) {
            $join->on('users.id', '=', 'transaction_sum_count.user_id');
        });


        $data->orderBy('total_funding.total_count', 'desc');


        // $query->filter(FilterRequest::only('search', 'trashed', 'user_id', 'status','role', 'package'));



        $chunkSize = 1000;


        $collection = collect();

        $data->filter($this->filters)->chunk($chunkSize, function ($User) use ($collection) {
            $collection->push($User);
        });

        // Flatten the collection to have a single-dimensional array
        $flattenedData = $collection->flatten();

        // Create the export instance and store the file
        $export = new UserAnalyticExport($flattenedData);

        // Construct the correct directory path using Storage facade
        $directoryPath = 'exports';
        $filePath = $directoryPath . DIRECTORY_SEPARATOR . $this->filename.'.xlsx';

        // Ensure that the directory exists
        Storage::makeDirectory($directoryPath);


        Excel::store($export, $filePath);

        // Perform any additional post-export tasks if needed
    }
}
