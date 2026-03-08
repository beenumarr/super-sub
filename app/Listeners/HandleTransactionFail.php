<?php

namespace App\Listeners;

use App\Jobs\SendWebhookEvent;
use Illuminate\Support\Facades\Log;
use App\Events\TransactionFailed;
use App\Notifications\InsufficientBalanceNotification;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Str;

class HandleTransactionFail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct() {}

    /**
     * Handle the event.
     */
    public function handle(TransactionFailed $event): void
    {
        $user = $event->user;
        $phoneNumber = $event->phoneNumber;
        $transaction = $event->transaction;
        $errorMessage = $event->errorMessage;

        // Dispatch webhook event
        SendWebhookEvent::dispatch($transaction);

        try {
            // check the error message and if it contains 'limit' or 'insufficient' or 'below minimum balance'


                $error = Str::lower($errorMessage);


                if (Str::contains($error, ['limit', 'insufficient', 'balance is below minimum', 'No phone number available']) && $transaction->metadata['plan_category'] === 'Direct Gifting') {

                    $phoneNumber->update([
                        'enable_datashare' => $phoneNumber->error_count > 1 ? false : true,
                        'error_count' => $phoneNumber->error_count + 1
                    ]);


                    if($phoneNumber->error_count > 0 && $phoneNumber->error_count < 8 &&  $transaction->metadata['plan_category'] === 'Direct Gifting'){
                        // send notification to user
                        $user->notify(new InsufficientBalanceNotification(
                            $phoneNumber,
                            $transaction,
                            $errorMessage
                        ));
                    }

                }




            // Send notification to user


            // Log::info('Insufficient balance notification sent successfully', [
            //     'user_id' => $user->id,
            //     'user_email' => $user->email,
            //     'phone_number' => $phoneNumber->number,
            //     'transaction_id' => $transaction->id,
            //     'error_message' => $errorMessage
            // ]);

        } catch (\Exception $e) {
            Log::error('Failed to send insufficient balance notification', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'phone_number' => $phoneNumber->number,
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
