<?php

namespace App\Jobs;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class SendWebhookEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 1;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 10;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Transaction $transaction
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Get user's webhook URL
        $user = $this->transaction->user;

        if (!$user || !$user->webhook_url) {
            Log::info('No webhook URL configured for user', [
                'transaction_id' => $this->transaction->id,
                'user_id' => $user?->id ?? 'N/A',
            ]);
            return;
        }

        $webhookUrl = $user->webhook_url;

        // Increment retry count
        $currentRetryCount = $this->transaction->webhook_retry_count ?? 0;
        $this->transaction->update([
            'webhook_retry_count' => $currentRetryCount + 1,
            'webhook_last_attempt_at' => now(),
        ]);

        // Prepare webhook payload
        $payload = $this->preparePayload();

        try {
            // Send webhook request
            $response = Http::timeout(10)
                ->retry(2, 100)
                ->post($webhookUrl, $payload);

            // Store response body
            $responseBody = $response->body();

            if ($response->successful()) {
                // Mark webhook as successfully sent
                $this->transaction->update([
                    'webhook_sent' => true,
                    'webhook_response_body' => $responseBody,
                    'webhook_sent_at' => now(),
                ]);

                Log::info('Webhook sent successfully', [
                    'transaction_id' => $this->transaction->id,
                    'user_id' => $user->id,
                    'webhook_url' => $webhookUrl,
                    'status_code' => $response->status(),
                    'retry_count' => $currentRetryCount + 1,
                ]);

            } else {
                // Store failed response
                $this->transaction->update([
                    'webhook_response_body' => $responseBody,
                ]);

                Log::warning('Webhook request failed', [
                    'transaction_id' => $this->transaction->id,
                    'user_id' => $user->id,
                    'webhook_url' => $webhookUrl,
                    'status_code' => $response->status(),
                    'response_body' => $responseBody,
                    'retry_count' => $currentRetryCount + 1,
                ]);

                // Throw exception to trigger retry
                throw new \Exception("Webhook failed with status code: {$response->status()}");
            }
        } catch (\Exception $e) {
            // Store error message
            $this->transaction->update([
                'webhook_response_body' => $e->getMessage(),
            ]);

            Log::error('Failed to send webhook', [
                'transaction_id' => $this->transaction->id,
                'user_id' => $user->id,
                'webhook_url' => $webhookUrl,
                'error' => $e->getMessage(),
                'retry_count' => $currentRetryCount + 1,
            ]);

            // Re-throw to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Prepare the webhook payload from transaction data.
     */
    protected function preparePayload(): array
    {
        $metadata = $this->transaction->metadata ?? [];

        // Get network name from provider_name or metadata
        $network = $this->transaction->provider_name ?? 'N/A';

        // Get data type/category
        $dataType = strtoupper($metadata['plan_category'] ?? 'DATA');

        // Get purchased plan name
        $purchasedPlan = $metadata['plan_name'] ?? 'N/A';

        // Get beneficiary phone number (mask it for privacy)
        $mobileNumber = $this->maskPhoneNumber($metadata['beneficiary'] ?? 'N/A');

        // Format transaction date
        $transactionDate = $this->transaction->created_at->format('d, M Y');

        // Determine status
        $status = strtolower($this->transaction->status);
        $statusText = $status === 'success' ? 'successful' : 'failed';

        return [
            'network' => $network,
            'data_type' => $dataType,
            'purchased_plan' => $purchasedPlan,
            'plan_amount' => (string) $this->transaction->amount,
            'ident' => $this->transaction->reference_id,
            'mobile_number' => $mobileNumber,
            'Status' => $statusText,
            'transaction_status' => $statusText,
            'api_response' => $this->transaction->api_response ?? 'Transaction ' . $statusText,
            'transaction_date' => $transactionDate,
        ];
    }

    /**
     * Mask phone number for privacy (show only first 4 and last 1 digits).
     */
    protected function maskPhoneNumber(string $phoneNumber): string
    {
        // Remove any non-digit characters
        // $cleaned = preg_replace('/\D/', '', $phoneNumber);

        // if (strlen($cleaned) >= 10) {
        //     // Show first 4 digits and mask the rest except last character
        //     $first = substr($cleaned, 0, 4);
        //     $last = substr($cleaned, -1);
        //     $masked = str_repeat('*', strlen($cleaned) - 5);
        //     return $first . $masked . $last;
        // }

        return $phoneNumber;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Webhook job failed after all retries', [
            'transaction_id' => $this->transaction->id,
            'user_id' => $this->transaction->user_id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}

