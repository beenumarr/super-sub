<?php

namespace App\Jobs;

use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Bus\Queueable;
use App\Models\WalletTransaction;
use App\Models\Transaction;
use App\Actions\Utils\MonnifyUtils;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class DisburseFund implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected $monnifyUtils;
    protected $transactionHelpers;
    protected $amount;
    protected $reference;

    /**
     * Create a new job instance.
     *
     * @param User $user
     * @param float $amount
     * @param string $reference
     */
    public function __construct(User $user, float $amount, string $reference)
    {
        $this->user = $user;
        $this->amount = $amount;
        $this->reference = $reference;
        $this->monnifyUtils = new MonnifyUtils();
        $this->transactionHelpers = new TransactionHelper();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $client = new Client();
        $url = config('settings.monnify_api_url');

        // Prepare request data for Monnify disbursement
        $data = [
            'amount' => $this->amount,
            'reference' => $this->reference,
            'narration' => "Airtime to Cash Disbursement - {$this->reference}",
            'bankCode' => $this->user->bank_code,
            'accountNumber' => $this->user->account_number,
            'accountName' => $this->user->account_name,
            'currencyCode' => 'NGN',
            'walletId' => config('settings.monnify_wallet_id'),
        ];

        try {
            // Initiate disbursement
            $response = $client->post("{$url}/api/v2/disbursements/single", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->monnifyUtils->generateApiToken(),
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $responseBody = json_decode($response->getBody(), true);

            // Check if request was successful
            if ($responseBody['requestSuccessful'] === true) {
                $transactionData = $responseBody['responseBody'];

                // Create transaction record
                $this->createTransaction($transactionData);

                Log::channel('monnify_transactions')->info(
                    "Disbursement initiated for transaction {$this->reference}",
                    [
                        'email' => $this->user->email,
                        'amount' => $this->amount,
                        'reference' => $this->reference,
                        'monnify_reference' => $transactionData['transactionReference'],
                    ]
                );
            } else {
                throw new Exception($responseBody['responseMessage'] ?? 'Disbursement failed');
            }

        } catch (Exception $e) {
            Log::error("Error initiating disbursement for user {$this->user->id}: " . $e->getMessage());
            $this->createFailedTransaction($e->getMessage());
            throw $e;
        }
    }

    /**
     * Create successful transaction record
     */
    protected function createTransaction($transactionData)
    {
        try {
            DB::beginTransaction();

            // Create wallet transaction
            $walletTransaction = WalletTransaction::create([
                'user_id' => $this->user->id,
                'wallet_id' => $this->user->wallet->id,
                'amount' => $this->amount,
                'type' => 'debit',
                'method' => 'AIRTIME_TO_CASH_DISBURSEMENT',
                'payment_gateway' => 'Monnify',
                'status' => 'processing',
                'reference' => $transactionData['transactionReference'],
            ]);

            // Create general transaction
            Transaction::create([
                'reference' => $this->reference,
                'user_id' => $this->user->id,
                'amount' => $this->amount,
                'status' => 'processing',
                'api_reference' => $transactionData['transactionReference'],
                'api_response' => json_encode($transactionData),
                'description' => "Airtime to Cash Disbursement",
                'balance_before' => $this->user->wallet->balance,
                'balance_after' => $this->user->wallet->balance - $this->amount,
                'transactionable_id' => $walletTransaction->id,
                'transactionable_type' => get_class($walletTransaction),
            ]);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error creating transaction record: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create failed transaction record
     */
    protected function createFailedTransaction($errorMessage)
    {
        try {
            DB::beginTransaction();

            // Create wallet transaction
            $walletTransaction = WalletTransaction::create([
                'user_id' => $this->user->id,
                'wallet_id' => $this->user->wallet->id,
                'amount' => $this->amount,
                'type' => 'debit',
                'method' => 'AIRTIME_TO_CASH_DISBURSEMENT',
                'payment_gateway' => 'Monnify',
                'status' => 'failed',
                'reference' => $this->reference,
            ]);

            // Create general transaction
            Transaction::create([
                'reference' => $this->reference,
                'user_id' => $this->user->id,
                'amount' => $this->amount,
                'status' => 'failed',
                'api_response' => $errorMessage,
                'description' => "Failed Airtime to Cash Disbursement",
                'balance_before' => $this->user->wallet->balance,
                'balance_after' => $this->user->wallet->balance - $this->amount,
                'transactionable_id' => $walletTransaction->id,
                'transactionable_type' => get_class($walletTransaction),
            ]);

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error creating failed transaction record: " . $e->getMessage());
        }
    }
}
