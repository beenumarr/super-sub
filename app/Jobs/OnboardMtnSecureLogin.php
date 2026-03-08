<?php
namespace App\Jobs;

use App\Models\PhoneNumber;
use App\Services\Mtn\MtnAccountService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class OnboardMtnSecureLogin implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300; // 5 minutes timeout
    public $tries = 3; // Retry 3 times if failed

    public function __construct(public PhoneNumber $phoneNumber) {}

    public function handle(MtnAccountService $mtnAccountService): void
    {
        $mtnAccountService->onboardKeys($this->phoneNumber);

        $mtnAccountService->getTokenWithPvK($this->phoneNumber);

        $mtnAccountService->getBalance($this->phoneNumber);

    }
}
