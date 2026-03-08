<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\PhoneNumber;
use App\Services\Mtn\MtnAccountService;
use App\Services\Airtel\AirtelSimService;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Cache;

class RefreshBalance implements ShouldQueue
{
    use Queueable;

    public $timeout = 600; // 10 minutes timeout


    /**
     * Create a new job instance.
     */
    public function __construct(
        public User $user,
        public ?array $phoneNumberIds = null,
        public ?string $jobId = null
    ) {
        $this->user = $user;
        $this->phoneNumberIds = $phoneNumberIds;
        $this->jobId = $jobId ?? uniqid('refresh_balance_');
    }

    /**
     * Execute the job.
     */
    public function handle(MtnAccountService $mtnAccountService, AirtelSimService $airtelSimService): void
    {
        // Get phone numbers to refresh
        if ($this->phoneNumberIds) {
            // Refresh specific phone numbers
            $phoneNumbers = $this->user->phoneNumbers()
                ->whereIn('id', $this->phoneNumberIds)
                ->get();
        } else {
            // Refresh all connected phone numbers for the user
            $phoneNumbers = $this->user->phoneNumbers()->get();
        }

        $total = $phoneNumbers->count();
        $processed = 0;
        $successful = 0;
        $failed = 0;

        // Initialize progress cache
        if ($this->jobId) {
            Cache::put("refresh_balance_progress_{$this->jobId}", [
                'total' => $total,
                'processed' => 0,
                'successful' => 0,
                'failed' => 0,
                'status' => 'processing',
                'started_at' => now()->toISOString(),
            ], 3600); // Cache for 1 hour
        }

        foreach ($phoneNumbers as $phoneNumber) {
            try {
                // Refresh balance based on network
                if ($phoneNumber->network_id === 1) { // MTN
                    $response = $mtnAccountService->getBalance($phoneNumber);

                    Log::info('Balance refreshed successfully for phone number: ' . $phoneNumber->number);
                    Log::info('Response: ' . json_encode($response));
                } elseif ($phoneNumber->network_id === 2) { // AIRTEL
                    $response = $airtelSimService->getBalance($phoneNumber);
                } else {
                    throw new \Exception('Unsupported network');
                }

                $processed++;
                if ($response['success']) {
                    $successful++;
                    Log::info('Balance refreshed successfully for phone number: ' . $phoneNumber->number);
                } else {
                    $failed++;
                    Log::warning('Failed to refresh balance for phone number: ' . $phoneNumber->number . ' - ' . ($response['message'] ?? 'Unknown error'));
                }

            } catch (\Exception $e) {
                $processed++;
                $failed++;
                Log::error('Error refreshing balance for phone number: ' . $phoneNumber->number . ' - ' . $e->getMessage());
            }

            // Update progress cache
            if ($this->jobId) {
                Cache::put("refresh_balance_progress_{$this->jobId}", [
                    'total' => $total,
                    'processed' => $processed,
                    'successful' => $successful,
                    'failed' => $failed,
                    'status' => $processed >= $total ? 'completed' : 'processing',
                    'started_at' => now()->toISOString(),
                    'completed_at' => $processed >= $total ? now()->toISOString() : null,
                ], 3600);
            }
        }

        // Final log
        Log::info("Bulk balance refresh completed for user {$this->user->id}: {$successful} successful, {$failed} failed out of {$total} total");
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        if ($this->jobId) {
            Cache::put("refresh_balance_progress_{$this->jobId}", [
                'status' => 'failed',
                'error' => $exception->getMessage(),
                'failed_at' => now()->toISOString(),
            ], 3600);
        }

        Log::error('Bulk balance refresh job failed for user ' . $this->user->id, [
            'error' => $exception->getMessage(),
            'phone_number_ids' => $this->phoneNumberIds,
        ]);
    }
}
