<?php

namespace App\Jobs;

use App\Models\DataPlanCategory;
use App\Models\User;
use App\Models\PhoneNumber;
use App\Services\Glo\GloApiService;
use Illuminate\Support\Facades\Log;
use App\Services\Momo\MomoApiService;
use App\Services\Mtn\MtnAccountService;
use App\Services\Airtel\AirtelSimService;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;


class RefreshAllGiftingSim implements ShouldQueue
{
    use Queueable;

    public $timeout = 600; // 10 minutes timeout
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public User $user,
        public $phoneNumbers,
        public string $network_id,
        public string $network_name,
        public int $category_id,
        public string $dispense_channel,
    ) {
        $this->user = $user;
        $this->network_id = $network_id;
        $this->network_name = $network_name;
        $this->category_id = $category_id;
        $this->dispense_channel = $dispense_channel;
    }

    /**
     * Execute the job.
     */
    public function handle(): void {

        foreach ($this->phoneNumbers as $phoneNumber) {


            if ($this->network_name) {
                Log::info('Refreshing Bulk Gifting Sim', [
                    'user'=>$this->user->name." - ".$this->user->email,
                    'network_name' => $this->network_name,
                    'phone_number_id' => $phoneNumber->number,
                ]);

                switch (strtoupper($this->network_name)) {
                    case 'MTN':
                        if($phoneNumber->plan_type_purchased === 'Momo App'){
                            app(MomoApiService::class)->getBalance($phoneNumber);
                        }else{
                            app(MtnAccountService::class)->getBalance($phoneNumber);
                        }
                        break;
                    case 'AIRTEL':
                        app(AirtelSimService::class)->getBalance($phoneNumber);
                        break;
                    case 'MOMO':
                        app(MomoApiService::class)->getBalance($phoneNumber);
                        break;
                    case 'GLO':
                        app(GloApiService::class)->getBalance($phoneNumber);
                        break;
                    default:
                        Log::warning('Unknown network for refresh all balance retrieval', [
                            'network_name' => $this->network_name,
                            'phone_number_id' => $phoneNumber->id
                        ]);
                        break;
                }
            }


        }

        $type = "Direct Gifting";

        if($this->dispense_channel === "MOMO"){
            $type = "Momo App";
        }

        $phoneNumberWithHighestBalance = PhoneNumber::where('user_id', $this->user->id)
            ->where('status', 'CONNECTED')
            ->where('network_id', $this->network_id)
            ->where('plan_type_purchased', $type)
            ->whereNull('daily_limit_at')
            ->orderBy('airtime_balance_value', 'desc')
            ->first();

        if(!$phoneNumberWithHighestBalance){
            Log::warning('No phone number found with highest balance', [
                'network_id' => $this->network_id,
                'user_id' => $this->user->id
            ]);
        }

        if ($phoneNumberWithHighestBalance) {

            $currentSettings = $this->user->settings ?? [];

            $dispense_method = $currentSettings[$this->category_id]['dispense_method'] ?? 'SIM';

            if($this->network_name == 'AIRTEL'){

                Log::info('Smartcash method', [
                    'phone_number_id' => $phoneNumberWithHighestBalance->id,
                    'mgnt_refresh_token' => $phoneNumberWithHighestBalance->mgnt_refresh_token,
                ]);

                if($phoneNumberWithHighestBalance->mgnt_refresh_token){
                    $dispense_method = "SMARTCASH_AIRTIME";
                }else{
                    $dispense_method = "SIM";
                }
            }

            $updatedSettings = [
                'dispense_method' => $dispense_method,
                'status' => 'ACTIVE',
                'phone_number_id' => $phoneNumberWithHighestBalance->id,
            ];

            $currentSettings[$this->category_id] = $updatedSettings;

            $this->user->update([
                'settings'=> $currentSettings
            ]);

            $phoneNumberWithHighestBalance->update([
                'enable_datashare' => true
            ]);
        } else {
            Log::warning('No phone number found with highest balance', [
                'network_id' => $this->network_id,
                'user_id' => $this->user->id
            ]);
        }

    }



}
