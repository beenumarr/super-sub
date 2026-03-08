<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\PhoneNumber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\TransactionService;
use Illuminate\Support\Facades\Cache;
use App\Services\Mtn\MtnAccountService;
use Illuminate\Foundation\Queue\Queueable;
use App\Services\Mtn\MtnTransactionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Validation\ValidationException;

class BulkLoadData implements ShouldQueue
{
    use Queueable;

    public $timeout = 1200; // 20 minutes timeout
    public $tries = 1;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public User $user,
        public array $phoneNumberIds,
        public int $planId,
        public ?string $jobId = null,
        public ?bool $enableSimCheck = false,
    ) {
        $this->user = $user;
        $this->phoneNumberIds = $phoneNumberIds;
        $this->planId = $planId;
        $this->jobId = $jobId ?? uniqid('load_data_');
        $this->enableSimCheck = $enableSimCheck ?? false;
    }

    /**
     * Execute the job.
     */
    public function handle(
        TransactionService $transactionService,
        MtnTransactionService $mtnTransactionService,
        TransactionHelper $helpers
    ): void {
        // Get phone numbers to load data for
        $phoneNumbers = PhoneNumber::where('user_id', $this->user->id)
            ->where('plan_type_purchased', 'Data Share')
            ->where('network_id', 1)
            ->whereIn('id', $this->phoneNumberIds)
            ->where('status', 'CONNECTED')
            ->get();

        $userSettings = $this->user->settings;

        $total = $phoneNumbers->count();
        $processed = 0;
        $successful = 0;
        $failed = 0;

        // Initialize progress cache
        if ($this->jobId) {
            Cache::put("load_data_progress_{$this->jobId}", [
                'total' => $total,
                'processed' => 0,
                'successful' => 0,
                'failed' => 0,
                'status' => 'processing',
                'started_at' => now()->toISOString(),
            ], 3600); // Cache for 1 hour
        }

        // Get plan details
        $plan = DB::table('data_plans')
            ->join('data_plan_categories', 'data_plans.data_plan_category_id', '=', 'data_plan_categories.id')
            ->join('networks', 'data_plan_categories.network_id', '=', 'networks.id')
            ->where('data_plans.id', $this->planId)
            ->select(
                'data_plans.id as plan_id',
                'data_plans.telco_price',
                'data_plans.price',
                'data_plans.name',
                'data_plans.size',
                'data_plans.volume',
                'data_plans.validity',
                'data_plans.product_id',
                'data_plans.api_id',
                'data_plans.product_type',
                'data_plan_categories.id as category_id',
                'data_plan_categories.name as category_name',
                'data_plan_categories.type as category_type',
                'networks.id as network_id',
                'networks.name as network_name'
            )
            ->first();

        if (!$plan) {
            Log::error('Plan not found for bulk load data', [
                'plan_id' => $this->planId,
                'user_id' => $this->user->id
            ]);
            return;
        }

        $masterPhoneNumber = null;
        if (!empty($userSettings['master_phone_number_id'])) {
            $masterPhoneNumber = PhoneNumber::find($userSettings['master_phone_number_id']);
        }

        if (!$masterPhoneNumber) {
            Log::error('Master phone number not found for bulk load data', [
                'user_id' => $this->user->id,
                'master_phone_number_id' => $userSettings['master_phone_number_id'] ?? null,
            ]);
            throw new \Exception('Master phone number not found');
        }

        foreach ($phoneNumbers as $phoneNumber) {

            // add duration calculation for the job execution
            // $startTime = microtime(true);


            if($phoneNumber->id === $masterPhoneNumber->id || $phoneNumber->has_active_plan === true){
                continue;
            }


            app(MtnAccountService::class)->getBalance($phoneNumber);

            $phoneNumber->refresh();

            $planSize = $this->getPlanSize2($plan->size, $plan->volume);

            $dataBalance = $phoneNumber->data_balance_value;

            if ($planSize > 0) {

                $threshold = $planSize * 0.7;

                if ($dataBalance >= $threshold) {

                    continue;
                }
            }


            // if($this->enableSimCheck){
            //     $eligiable = $this->checkSimLimit($phoneNumber->number, $masterPhoneNumber);
            //     if(!$eligiable){
            //         continue;
            //     }
            // }


            try {

                if ($phoneNumber->status !== 'CONNECTED') {
                    $processed++;
                    $failed++;
                    Log::warning('Phone number not connected for data loading', [
                        'phone_number_id' => $phoneNumber->id,
                        'phone_number' => $phoneNumber->number,
                        'status' => $phoneNumber->status
                    ]);
                    continue;
                }

                $beneficiary = $helpers->formatPhoneNumber($phoneNumber->number, $plan->network_name);

                $transactionData = $transactionService->performTransaction(
                    $this->user, $beneficiary, $plan, $masterPhoneNumber
                );

                if (!$transactionData) {
                    throw new \Exception('Failed to initiate transaction');
                }

                $response = $mtnTransactionService->subscribe(
                    $transactionData->transaction,
                    $plan,
                    $masterPhoneNumber
                );

                Log::channel('data_transactions')->info("Bulk Data Transaction", [
                    'email'        => $this->user->email,
                    'plan'         => $plan->name,
                    'beneficiary'  => $phoneNumber->number,
                    'network'      => $plan->network_name,
                    'status'       => $transactionData->transaction->status,
                    'api_response' => $response['message'] ?? 'N/A',
                ]);

                $processed++;
                if ($response['success']) {
                    $successful++;
                    $phoneNumber->update(['has_active_plan'=> true]);
                    app(MtnAccountService::class)->getBalance($phoneNumber);
                } else {
                    $failed++;
                    Log::warning('Failed to load data for phone number: ' . $phoneNumber->number . ' - ' . ($response['message'] ?? 'Unknown error'));
                }

            } catch (\Exception $e) {
                $processed++;
                $failed++;
                Log::error('Error loading data for phone number: ' . $phoneNumber->number . ' - ' . $e->getMessage());
            }

            if ($this->jobId) {
                Cache::put("load_data_progress_{$this->jobId}", [
                    'total' => $total,
                    'processed' => $processed,
                    'successful' => $successful,
                    'failed' => $failed,
                    'status' => 'processing',
                    'started_at' => now()->toISOString(),
                ], 3600);
            }

            // // add duration calculation for the phone number execution
            // $endTime = microtime(true);
            // $duration = $endTime - $startTime;
            // Log::info('Duration for phone number: ' . $phoneNumber->number . ' - ' . $duration . ' seconds');
        }

        if ($this->jobId) {
            Cache::put("load_data_progress_{$this->jobId}", [
                'total' => $total,
                'processed' => $processed,
                'successful' => $successful,
                'failed' => $failed,
                'status' => 'completed',
                'started_at' => now()->toISOString(),
                'completed_at' => now()->toISOString(),
            ], 3600);
        }

        Log::info('Bulk load data job completed', [
            'user' => $this->user->name." - ".$this->user->email,
            'total' => $total,
            'processed' => $processed,
            'successful' => $successful,
            'failed' => $failed,
            'plan_id' => $plan->name." ID:".$this->planId
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Bulk load data job failed', [
            'user_id' => $this->user->id,
            'phone_number_ids' => $this->phoneNumberIds,
            'plan_id' => $this->planId,
            'error' => $exception->getMessage()
        ]);

        if ($this->jobId) {
            Cache::put("load_data_progress_{$this->jobId}", [
                'status' => 'failed',
                'error' => $exception->getMessage(),
                'failed_at' => now()->toISOString(),
            ], 3600);
        }
    }


    public function getPlanSize2($size, $volume, $unit = 'MB'): int
    {
        if($unit === 'MB' && $volume === 'MB'){
            return $size;
        }

        if($unit === 'GB' && $volume === 'MB'){
            return $size / 1024;
        }

        if($unit === 'MB' && $volume === 'GB'){
            return $size * 1024;
        }

        if($unit === 'GB' && $volume === 'GB'){
            return $size;
        }

        return 0;
    }


    public function checkSimLimit($number, $masterPhoneNumber)
    {


        $transactions = [];
        $eligiable = false;

        $filters = [
            'start_date' => \Carbon\Carbon::now()->startOfMonth()->format('Ymd'),
            'end_date' => \Carbon\Carbon::now()->endOfMonth()->format('Ymd'),
            'customer_id' => $number
        ];

        $res = app(MtnAccountService::class)->getTransactionHistory($masterPhoneNumber, $filters);

        if ($res['success'] && count($res['data']) > 0) {


            $transactions = $res['data'];

            // Log::info('Transactions retrieved successfully for phone number: ', [ 'number' => $number, 'transactions' => $transactions]);

            $currentMonth = \Carbon\Carbon::now()->format('Ym'); // e.g., "202510"
            $currentMonthTransactions = collect($transactions)->filter(function ($transaction) use ($currentMonth) {
                $transactionMonth = substr($transaction['date'], 0, 6);
                return $transactionMonth === $currentMonth && $transaction['transactionType'] === "Data Share";
            });

            $currentMonthCount = $currentMonthTransactions->count();

            // Log::info('Current month transaction count: ', [
            //     'number' => $number,
            //     'current_month' => $currentMonth,
            //     'transaction_count' => $currentMonthCount
            // ]);


            $maxTransactionsPerMonth = 2;
            $eligiable = $currentMonthCount < $maxTransactionsPerMonth;

            // Log::info('Eligibility check result: ', [
            //     'number' => $number,
            //     'eligible' => $eligiable,
            //     'current_count' => $currentMonthCount,
            //     'max_allowed' => $maxTransactionsPerMonth
            // ]);
        }

        else{
            Log::error('No transactions retrieved for phone number: ' . $number);

        }


        return $eligiable;

    }
}
