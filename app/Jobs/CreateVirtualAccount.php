<?php

namespace App\Jobs;

use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Bus\Queueable;
use App\Models\FundingAccount;
use App\Actions\Utils\MonnifyUtils;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;

class CreateVirtualAccount implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected $temporary;
    protected $monnifyUtils;

    /**
     * Create a new job instance.
     *
     * @param User $user
     * @param bool $temporary
     */
    public function __construct(User $user, $temporary = false)
    {
        $this->user = $user;
        $this->temporary = $temporary;
        $this->monnifyUtils = new MonnifyUtils();
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $reference = uniqid();
        $client = new Client();
        $url = config('settings.monnify_api_url');

        // Get site-level BVN and NIN if available
        $siteBvn = config('settings.temp_account_bvn');
        $siteNin = config('settings.temp_account_nin');

        // Prepare request data
        $data = [
            'accountReference' => $reference,
            'accountName' => $this->user->name,
            'currencyCode' => 'NGN',
            'contractCode' => config('settings.monnify_contract_code'),
            'customerEmail' => $this->user->email,
            'customerName' => $this->user->name,
            'getAllAvailableBanks' => false,
            "preferredBanks"=> ["232", "035", "50515", "058"]
        ];



        // Check and decrypt user's BVN and NIN if available and not temporary
        if (!empty($this->user->bvn) && !$this->temporary) {
            $data['bvn'] = cs_decrypt($this->user->bvn);
        }else if($this->temporary && $siteBvn){
            $data['bvn'] =  cs_decrypt($siteBvn);

        }

        if (!empty($this->user->nin) && !$this->temporary) {
            $data['nin'] = cs_decrypt($this->user->nin);
        }else if($this->temporary && $siteNin){
            $data['nin'] =  cs_decrypt($siteNin);
        }



        try {
            $response = $client->post("{$url}/api/v2/bank-transfer/reserved-accounts", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->monnifyUtils->generateApiToken(),
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $responseBody = json_decode($response->getBody(), true);

            // Check if request was successful
            if ($responseBody['requestSuccessful'] === true) {
                $accounts = $responseBody['responseBody']['accounts'];

                // Save account information in the FundingAccount table
                foreach ($accounts as $account) {
                    FundingAccount::create([
                        'user_id' => $this->user->id,
                        'reference' => $reference,
                        'bank_code' => $account['bankCode'],
                        'bank_name' => $account['bankName'],
                        'account_number' => $account['accountNumber'],
                        'account_name' => config('settings.site_name') . " - " . $account['accountName'],
                        'account_type' => $this->temporary ? 'temporary' : 'permanent',
                    ]);
                }
            }

        } catch (\Exception $e) {
            // Log and report the exception
            Log::error("Error creating virtual account for user {$this->user->id}: " . $e->getMessage());
            report($e);
        }
    }
}
