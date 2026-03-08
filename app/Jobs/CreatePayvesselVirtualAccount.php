<?php

namespace App\Jobs;

use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Bus\Queueable;
use App\Models\FundingAccount;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;

class CreatePayvesselVirtualAccount implements ShouldQueue
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
        $client = new Client();

        // Config settings
        $apiKey = config('settings.payvessel_api_key');
        $apiSecret = config('settings.payvessel_secret_key');
        $businessId = config('settings.payvessel_business_id');
        $apiUrl = config('settings.payvessel_api_url');

        // Site BVN and NIN
        $siteBvn = config('settings.temp_account_bvn');
        $siteNin = config('settings.temp_account_nin');

        // Prepare request data
        $data = [
            'email' => $this->user->email,
            'name' => $this->user->name,
            'phoneNumber' => $this->user->phone,
            'bankcode' => ['120001'],
            'account_type' => 'STATIC',
            'businessid' => $businessId,
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
            $response = $client->post("$apiUrl/api/external/request/customerReservedAccount/", [
                'headers' => [
                    'api-key' => $apiKey,
                    'api-secret' => 'Bearer '.cs_decrypt($apiSecret),
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $responseBody = json_decode($response->getBody(), true);

            if ($responseBody['status'] === true) {
                $accounts = $responseBody['banks'];

                // Save each account to the FundingAccount table
                foreach ($accounts as $account) {
                    FundingAccount::create([
                        'user_id' => $this->user->id,
                        'reference' => $account['trackingReference'],
                        'bank_code' => $account['bankCode'],
                        'bank_name' => $account['bankName'],
                        'account_number' => $account['accountNumber'],
                        'account_name' => $account['accountName'],
                        'gateway' => 'Payvessel',
                        'account_type' => $this->temporary ? 'temporary' : $account['account_type'],
                        'expire_date' => $account['expire_date'],
                    ]);
                }
            }

        } catch (\Exception $e) {
            // Log and report the exception
            Log::error("Error creating Payvessel virtual account: " . $e->getMessage());
            report($e);
        }
    }
}
