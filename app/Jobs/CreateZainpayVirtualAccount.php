<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\PaymentGateway\Zainpay\ZainpayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CreateZainpayVirtualAccount implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected $temporary;

    /**
     * Create a new job instance.
     *
     * @param User $user
     * @param bool $temporary
     */
    public function __construct(User $user, bool $temporary = false)
    {
        $this->user = $user;
        $this->temporary = $temporary;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        if (config('settings.zainpay_service') !== '1') {
            return;
        }

        try {
            $result = ZainpayService::createVirtualAccount($this->user, $this->temporary);

            if (!($result['success'] ?? false)) {
                Log::warning("CreateZainpayVirtualAccount failed for user {$this->user->id}: " . ($result['message'] ?? 'Unknown error'));
            }
        } catch (\Exception $e) {
            Log::error("CreateZainpayVirtualAccount exception for user {$this->user->id}: " . $e->getMessage());
        }
    }
}
