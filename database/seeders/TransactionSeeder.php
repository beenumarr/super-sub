<?php

namespace Database\Seeders;

use App\Models\CableNetwork;
use App\Models\CableSubscriptionPlan;
use App\Models\DataPlan;
use App\Models\ElectricityDistributor;
use App\Models\ExamType;
use App\Models\MobileNetwork;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TransactionSeeder extends Seeder
{
    /**
     * Seed sample centralized transactions for testing.
     */
    public function run(): void
    {
        $faker = fake();

        $users = User::with('wallet')->get();
        if ($users->isEmpty()) {
            $users = collect();
            for ($i = 0; $i < 2; $i++) {
                $user = User::create([
                    'name' => $faker->name(),
                    'username' => Str::lower($faker->unique()->userName()),
                    'email' => $faker->unique()->safeEmail(),
                    'phone_number' => $faker->numerify('080########'),
                    'address' => $faker->address(),
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]);

                $user->wallet()->create([
                    'balance' => $faker->randomFloat(2, 1000, 5000),
                ]);

                $users->push($user->fresh('wallet'));
            }
        }

        $mobileNetworkIds = MobileNetwork::pluck('id')->all();
        $dataPlanIds = DataPlan::pluck('id')->all();
        $cableNetworkIds = CableNetwork::pluck('id')->all();
        $cablePlanIds = CableSubscriptionPlan::pluck('id')->all();
        $electricityDistributorIds = ElectricityDistributor::pluck('id')->all();
        $examTypes = ExamType::all();

        $types = [
            'DATA',
            'AIRTIME',
            'CABLE',
            'ELECTRICITY',
            'RESULT_CHECKER',
            'WALLET',
        ];

        for ($i = 0; $i < 20; $i++) {
            $user = $users->random();
            $wallet = $user->wallet ?? Wallet::create([
                'user_id' => $user->id,
                'balance' => $faker->randomFloat(2, 1000, 5000),
            ]);

            $balanceBefore = (float) $wallet->balance;
            $balanceAfter = $balanceBefore;

            $type = $faker->randomElement($types);
            $status = $faker->randomElement(['SUCCESS', 'FAILED', 'PENDING']);

            $amount = $faker->randomFloat(2, 100, 5000);
            $referenceId = 'TX-' . Str::uuid();

            $providerName = null;
            $providerId = null;
            $productId = null;
            $productCategory = null;
            $metadata = [];
            $description = 'Test transaction';

            switch ($type) {
                case 'DATA':
                    if (empty($mobileNetworkIds) || empty($dataPlanIds)) {
                        continue 2;
                    }

                    $providerId = (string) $faker->randomElement($mobileNetworkIds);
                    $productId = (string) $faker->randomElement($dataPlanIds);
                    $network = MobileNetwork::find($providerId);
                    $plan = DataPlan::find($productId);
                    $providerName = $network?->name;
                    $productCategory = 'DATA';
                    $beneficiary = $faker->numerify('080########');
                    $description = ($plan?->size ? ($plan->size . Str::upper($plan->volume)) : 'Data') . " {$providerName} to {$beneficiary}";
                    $metadata = [
                        'beneficiary' => $beneficiary,
                        'network_id' => (int) $providerId,
                        'network' => $providerName,
                        'plan_id' => (int) $productId,
                    ];
                    break;

                case 'AIRTIME':
                    if (empty($mobileNetworkIds)) {
                        continue 2;
                    }

                    $providerId = (string) $faker->randomElement($mobileNetworkIds);
                    $network = MobileNetwork::find($providerId);
                    $providerName = $network?->name;
                    $productCategory = 'AIRTIME';
                    $beneficiary = $faker->numerify('080########');
                    $description = "{$amount} {$providerName} Airtime to {$beneficiary}";
                    $metadata = [
                        'beneficiary' => $beneficiary,
                        'network_id' => (int) $providerId,
                        'network' => $providerName,
                        'requested_amount' => $amount,
                    ];
                    break;

                case 'CABLE':
                    if (empty($cableNetworkIds) || empty($cablePlanIds)) {
                        continue 2;
                    }

                    $providerId = (string) $faker->randomElement($cableNetworkIds);
                    $productId = (string) $faker->randomElement($cablePlanIds);
                    $network = CableNetwork::find($providerId);
                    $plan = CableSubscriptionPlan::find($productId);
                    $providerName = $network?->name;
                    $productCategory = 'CABLE';
                    $smartCard = $faker->numerify('##########');
                    $customerName = $faker->name();
                    $description = ($plan?->package_name ?? 'Cable') . " ({$amount}) {$providerName} to {$smartCard} ({$customerName})";
                    $metadata = [
                        'beneficiary' => $smartCard,
                        'smart_card_number' => $smartCard,
                        'name' => $customerName,
                        'network_id' => (int) $providerId,
                        'network' => $providerName,
                        'plan_id' => (int) $productId,
                        'plan_name' => $plan?->package_name,
                        'product_code' => $plan?->product_code,
                    ];
                    break;

                case 'ELECTRICITY':
                    if (empty($electricityDistributorIds)) {
                        continue 2;
                    }

                    $providerId = (string) $faker->randomElement($electricityDistributorIds);
                    $distributor = ElectricityDistributor::find($providerId);
                    $providerName = $distributor?->name;
                    $productCategory = 'ELECTRICITY';
                    $meter = $faker->numerify('##########');
                    $customerName = $faker->name();
                    $description = "{$amount} {$providerName} Bill Payment to {$meter} ({$customerName})";
                    $metadata = [
                        'beneficiary' => $meter,
                        'electricity_distributor_id' => (int) $providerId,
                        'distributor' => $providerName,
                        'meter_number' => $meter,
                        'meter_type' => $faker->randomElement(['prepaid', 'postpaid']),
                        'name' => $customerName,
                        'phone_number' => $faker->numerify('080########'),
                        'address' => $faker->address(),
                    ];
                    break;

                case 'RESULT_CHECKER':
                    if ($examTypes->isEmpty()) {
                        continue 2;
                    }

                    $examType = $examTypes->random();
                    $providerId = (string) $examType->id;
                    $providerName = $examType->name;
                    $productCategory = 'RESULT_CHECKER';
                    $qty = $faker->numberBetween(1, 3);
                    $amount = (float) ($examType->amount * $qty);
                    $description = "{$examType->name} Pin Purchase";
                    $metadata = [
                        'exam_type_id' => $examType->id,
                        'exam_type' => $examType->name,
                        'quantity' => $qty,
                    ];
                    break;

                case 'WALLET':
                default:
                    $ledgerType = $faker->randomElement(['credit', 'debit']);
                    $providerName = $faker->randomElement(['Paystack', 'Monnify', 'SYSTEM']);
                    $productCategory = 'WALLET';
                    $description = ucfirst($ledgerType) . " wallet transaction ({$providerName})";
                    $metadata = [
                        'ledger_type' => $ledgerType,
                        'method' => $providerName === 'SYSTEM' ? 'MANUAL' : 'WALLET_FUNDING',
                        'payment_gateway' => $providerName,
                    ];

                    if ($status === 'SUCCESS') {
                        $balanceAfter = $ledgerType === 'credit'
                            ? $balanceBefore + $amount
                            : max(0, $balanceBefore - $amount);
                        $wallet->update(['balance' => $balanceAfter]);
                    }
                    break;
            }

            if ($type !== 'WALLET' && $status === 'SUCCESS') {
                $balanceAfter = max(0, $balanceBefore - $amount);
                $wallet->update(['balance' => $balanceAfter]);
            }

            Transaction::create([
                'reference_id' => $referenceId,
                'user_id' => $user->id,
                'type' => $type,
                'provider_name' => $providerName,
                'provider_id' => $providerId,
                'product_id' => $productId,
                'product_category' => $productCategory,
                'amount' => $amount,
                'status' => $status,
                'description' => $description,
                'api_response' => $status === 'SUCCESS' ? 'Transaction successful' : "Transaction {$status}",
                'balance_before' => (string) $balanceBefore,
                'balance_after' => (string) ($wallet->fresh()->balance ?? $balanceBefore),
                'metadata' => $metadata,
            ]);
        }
    }
}

