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
        $apiKey = config('settings.monnify_api_key');
        $isTest = str_starts_with($apiKey ?? '', 'MK_TEST_');
        $url = $isTest ? 'https://sandbox.monnify.com' : (config('settings.monnify_api_url') ?: 'https://api.monnify.com');

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
            "preferredBanks" => ["232", "035", "50515", "058"]
        ];

        // Check and decrypt user's BVN and NIN if available and not temporary
        if (!empty($this->user->bvn) && !$this->temporary) {
            $data['bvn'] = cs_decrypt($this->user->bvn);
        } else if ($this->temporary && $siteBvn) {
            $data['bvn'] = cs_decrypt($siteBvn);
        }

        if (!empty($this->user->nin) && !$this->temporary) {
            $data['nin'] = cs_decrypt($this->user->nin);
        } else if ($this->temporary && $siteNin) {
            $data['nin'] = cs_decrypt($siteNin);
        }

        $apiToken = $this->monnifyUtils->generateApiToken();
        if (empty($apiToken)) {
            Log::error("Failed to generate Monnify auth token for user {$this->user->id}");
            throw new \Exception('Failed to authenticate with Monnify. Please verify your Monnify API Key and Secret Key in settings.');
        }

        try {
            $response = $client->post("{$url}/api/v2/bank-transfer/reserved-accounts", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiToken,
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $responseBody = json_decode($response->getBody(), true);

            // Check if request was successful
            if (($responseBody['requestSuccessful'] ?? false) === true) {
                $accounts = $responseBody['responseBody']['accounts'] ?? [];

                // Save or update account information in the FundingAccount table
                foreach ($accounts as $account) {
                    FundingAccount::updateOrCreate(
                        [
                            'user_id' => $this->user->id,
                            'bank_code' => $account['bankCode'],
                            'account_type' => $this->temporary ? 'temporary' : 'permanent',
                        ],
                        [
                            'reference' => $reference,
                            'bank_name' => $account['bankName'],
                            'account_number' => $account['accountNumber'],
                            'account_name' => (config('settings.site_name') ?: 'SuperSub') . " - " . ($account['accountName'] ?? $this->user->name),
                            'active' => 1,
                        ]
                    );
                }
            } else {
                $errMsg = $responseBody['responseMessage'] ?? 'Failed to reserve virtual account with Monnify.';
                Log::error("Monnify reservation failed for user {$this->user->id}: " . $errMsg);
                throw new \Exception($errMsg);
            }

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $resBody = $e->getResponse() ? (string) $e->getResponse()->getBody() : '';
            $decoded = json_decode($resBody, true);
            $msg = $decoded['responseMessage'] ?? $decoded['error_description'] ?? $e->getMessage();

            // If Monnify reports that the customer already has a reserved account, recover existing accounts
            if (str_contains(strtolower($msg), 'cannot reserve more than 1') || str_contains(strtolower($msg), 'already')) {
                $existingRef = FundingAccount::where('user_id', $this->user->id)
                    ->whereNotNull('reference')
                    ->value('reference');

                if ($existingRef) {
                    try {
                        $getRes = $client->get("{$url}/api/v2/bank-transfer/reserved-accounts/{$existingRef}", [
                            'headers' => [
                                'Authorization' => 'Bearer ' . $apiToken,
                            ],
                        ]);
                        $getBody = json_decode($getRes->getBody(), true);
                        if (($getBody['requestSuccessful'] ?? false) === true) {
                            $recoveredAccounts = $getBody['responseBody']['accounts'] ?? [];
                            foreach ($recoveredAccounts as $account) {
                                FundingAccount::updateOrCreate(
                                    [
                                        'user_id' => $this->user->id,
                                        'bank_code' => $account['bankCode'],
                                        'account_type' => $this->temporary ? 'temporary' : 'permanent',
                                    ],
                                    [
                                        'reference' => $existingRef,
                                        'bank_name' => $account['bankName'],
                                        'account_number' => $account['accountNumber'],
                                        'account_name' => (config('settings.site_name') ?: 'SuperSub') . " - " . ($account['accountName'] ?? $this->user->name),
                                        'active' => 1,
                                    ]
                                );
                            }
                            Log::info("Recovered Monnify reserved accounts for user {$this->user->id}");
                            return;
                        }
                    } catch (\Exception $ex) {
                        Log::warning("Could not fetch reserved account {$existingRef} from Monnify: " . $ex->getMessage());
                    }
                }

                // If user already has accounts stored locally, don't throw an error
                $hasLocalAccounts = FundingAccount::where('user_id', $this->user->id)
                    ->where('account_type', '!=', 'temporary')
                    ->where('active', 1)
                    ->exists();
                if ($hasLocalAccounts) {
                    return;
                }
            }

            Log::error("Error creating virtual account for user {$this->user->id}: " . $msg);
            throw new \Exception($msg);
        } catch (\Exception $e) {
            Log::error("Error creating virtual account for user {$this->user->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
