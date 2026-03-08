<?php

namespace App\Console\Commands;

use App\Jobs\ProcessDailyBilling;
use Illuminate\Console\Command;

class ProcessDailyBillingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billing:process-daily';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process daily billing for all postpaid users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting daily billing process...');
        
        try {
            // Dispatch the job synchronously
            ProcessDailyBilling::dispatchSync();
            
            $this->info('Daily billing process completed successfully!');
            $this->info('Check logs for detailed information.');
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Daily billing process failed: ' . $e->getMessage());
            $this->error('Check logs for more details.');
            
            return Command::FAILURE;
        }
    }
}
