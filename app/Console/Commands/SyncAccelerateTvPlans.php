<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CableNetwork;
use App\Models\CableSubscriptionPlan;
use App\Models\TransactionApi;
use App\Models\ApiId;
use App\Actions\APIs\Accelerate\AccelerateClient;

class SyncAccelerateTvPlans extends Command
{
    protected $signature = 'accelerate:sync-tv-plans {--sync : Automatically update or create database plans}';
    protected $description = 'Fetch and optionally sync TV subscription packages from Accelerate SuperMerchant API';

    public function handle(): int
    {
        $api = TransactionApi::where('model', 'APIs\\Accelerate\\')->first();
        if (!$api) {
            $this->error('Accelerate API is not configured in transaction_apis table.');
            return 1;
        }

        $client = new AccelerateClient($api);

        $providers = [
            'DSTV' => 'DSTV',
            'GOTV' => 'GOTV',
            'STARTIME' => 'STARTIMES',
        ];

        $shouldSync = $this->option('sync');

        foreach ($providers as $localNetworkName => $accelProviderName) {
            $this->info("Fetching packages for {$accelProviderName}...");

            $cableNetwork = CableNetwork::where('name', $localNetworkName)->first();
            if (!$cableNetwork && $shouldSync) {
                $this->warn("Local cable network {$localNetworkName} not found in database.");
                continue;
            }

            try {
                $res = $client->getTvPackages($accelProviderName, 1, 100);
                $packages = $res['data']['packages'] ?? $res['data'] ?? $res['packages'] ?? [];

                if (empty($packages) || !is_array($packages)) {
                    $this->warn("No packages returned for {$accelProviderName}. Response: " . json_encode($res));
                    continue;
                }

                $rows = [];
                foreach ($packages as $pkg) {
                    $code = $pkg['package_code'] ?? $pkg['code'] ?? $pkg['package'] ?? $pkg['id'] ?? null;
                    $name = $pkg['package_name'] ?? $pkg['name'] ?? $pkg['title'] ?? 'Unknown';
                    $amount = $pkg['amount'] ?? $pkg['price'] ?? 0;

                    $rows[] = [$code, $name, $amount];

                    if ($shouldSync && $code && $cableNetwork) {
                        $plan = CableSubscriptionPlan::firstOrCreate(
                            [
                                'cable_network_id' => $cableNetwork->id,
                                'product_code' => $code,
                            ],
                            [
                                'package_name' => $name,
                                'amount' => $amount,
                                'validity' => '1 Month',
                                'active' => 1,
                            ]
                        );

                        // Attach Accelerate ApiId
                        ApiId::updateOrCreate(
                            [
                                'apiable_type' => CableSubscriptionPlan::class,
                                'apiable_id' => $plan->id,
                                'transaction_api_id' => $api->id,
                            ],
                            [
                                'product_code' => $code,
                                'product_id' => $code,
                            ]
                        );
                    }
                }

                $this->table(['Package Code', 'Package Name', 'Amount (NGN)'], $rows);

                if ($shouldSync) {
                    $this->info("Synced " . count($rows) . " packages for {$localNetworkName}.");
                }
            } catch (\Exception $e) {
                $this->error("Failed to fetch packages for {$accelProviderName}: " . $e->getMessage());
            }
        }

        $this->info('Completed Accelerate TV plan inspection.');
        return 0;
    }
}
