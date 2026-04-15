<?php

namespace App\Services\PaymentGateway\Payvessel;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class HandleTransactionCompletionWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $payload;

    /**
     * Create a new job instance.
     */
    public function __construct($payload)
    {
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {

        $helpers = new TransactionHelper();

        $amount = floatval($this->payload['order']['amount']);
        $settlementAmount = floatval($this->payload['order']['settlement_amount']);
        $reference = $this->payload['transaction']['reference'];
        $description = $this->payload['order']['description'];
        $email = $this->payload['customer']['email'];
        $code = $this->payload['code'];


        // Check if reference already exists in your payment transaction table
        if (Transaction::where('provider_reference', $reference)->exists()) {
            Log::warning('Reference Exist', ['reference' => $reference]);
            throw new \RuntimeException('Reference Exist, Duplicate Transaction');

        } else {


            if($code == "00"){

                $chargesType = config('settings.payvessel_funding_charges');
                $funded_amount = $amount;

                if($chargesType === 'settlement_amount'){
                    $funded_amount = $settlementAmount;
                }else{
                    $charges = $helpers->applyFundingCharges($amount, $chargesType);
                    $funded_amount = floatval($amount) - $charges;
                }

                $user = User::where('email', $email)->first();
                $wallet = $user->wallet;
                $balance_before = $wallet->balance;
                $wallet->increment('balance', $funded_amount);
                $balance_after = $wallet->balance;

                 // Store Transaction Records
                Transaction::create([
                    'reference_id' => $helpers->generateTransactionRef('WT'),
                    'user_id' => $user->id,
                    'type' => 'WALLET',
                    'amount' => $amount,
                    'status' => 'SUCCESS',
                    'provider_name' => 'Payvessel',
                    'provider_reference' => $reference,
                    'api_response' => $description,
                    'description' => $description,
                    'balance_before' => $balance_before,
                    'balance_after' => $balance_after,
                    'metadata' => [
                        'ledger_type' => 'credit',
                        'method' => 'TRANSFER',
                        'payment_gateway' => 'Payvessel',
                        'settlement_amount' => $settlementAmount,
                        'funded_amount' => $funded_amount,
                    ],
                ]);

                Log::channel('payvessel_transactions')
                ->info("Payment received for transaction $reference.", [
                        'email'=> $email,
                        'amount'=> $amount,
                        'descriptions'=> $description,
                        'paymentStatus'=> $code ,
                        'balance_before'=> $balance_before,
                        'balance_after'=> $balance_after
                    ] );
            }

        }



    }




}
