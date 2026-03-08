<?php

namespace App\Listeners;

use App\Jobs\SendWebhookEvent;
use App\Services\Glo\GloApiService;
use Illuminate\Support\Facades\Log;
use App\Events\TransactionSucceeded;
use App\Services\Momo\MomoApiService;
use App\Services\Mtn\MtnAccountService;
use Illuminate\Queue\InteractsWithQueue;
use App\Services\Airtel\AirtelSimService;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Utils\Transaction\TransactionHelper;

class HandleTransactionSuccess implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct() {}

    /**
     * Handle the event.
     */
    public function handle(TransactionSucceeded $event): void
    {
        $transaction = $event->transaction;
        $phoneNumber = $event->phoneNumber;


        // Update phone number stats if plan category is Data Share

        if( isset($transaction->metadata['plan_category']) && $transaction->metadata['plan_category'] === 'Data Share'){
            try {
                app(TransactionHelper::class)->updatePhoneNumberStats(
                    $phoneNumber,
                    $transaction->metadata['full_size'] ?? 0
                );
            } catch (\Exception $e) {
                Log::error('Failed to update phone number stats', [
                    'transaction_id' => $transaction->id,
                    'phone_number' => $phoneNumber->number,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }else if($phoneNumber->plan_type_purchased === 'Momo App'){

            try {
                // Handle limit checks with proper locking
                $phoneNumber->lockForUpdate();
                $amount = (float) (
                    (isset($transaction->metadata['telco_price']) ? $transaction->metadata['telco_price'] :
                    (isset($transaction->metadata['amount']) ? $transaction->metadata['amount'] : 0))
                );
                $phoneNumber->increment('daily_shared_value', $amount);

            } catch (\Exception $e) {
                Log::error('Failed to update phone number stats', [
                    'transaction_id' => $transaction->id,
                    'phone_number' => $phoneNumber->number,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        // Get account balance
        try {

            $network = $phoneNumber->network;

            if ($network) {
                switch (strtoupper($network->name)) {
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
                        Log::warning('Unknown network for balance retrieval', [
                            'transaction_id' => $transaction->id,
                            'phone_number' => $phoneNumber->number,
                            'network' => $network->name ?? 'unknown',
                        ]);
                        break;
                }
            }

            if($phoneNumber->error_count > 0){
                $phoneNumber->update([
                    'enable_datashare' => true,
                    'error_count' => 0
                ]);
            }


        } catch (\Exception $e) {
            Log::error('Failed to get account balance', [
                'transaction_id' => $transaction->id,
                'phone_number' => $phoneNumber->number,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
