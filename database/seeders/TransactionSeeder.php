<?php

namespace Database\Seeders;

use App\Models\AirtimeTransaction;
use App\Models\CableNetwork;
use App\Models\CableSubscriptionPlan;
use App\Models\CableSubscriptionTransaction;
use App\Models\DataPlan;
use App\Models\DataTransaction;
use App\Models\ElectricityBillTransaction;
use App\Models\ElectricityDistributor;
use App\Models\ExamType;
use App\Models\MobileNetwork;
use App\Models\ResultCheckerTransaction;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TransactionSeeder extends Seeder
{
    /**
     * Seed 20 transactions across all supported types for testing.
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
            'data',
            'airtime',
            'cable',
            'electricity',
            'result_checker',
            'wallet',
        ];

        for ($i = 0; $i < 20; $i++) {
            $user = $users->random();
            $wallet = $user->wallet ?? Wallet::create([
                'user_id' => $user->id,
                'balance' => $faker->randomFloat(2, 1000, 5000),
            ]);

            $balanceBefore = (float) $wallet->balance;
            $balanceAfter = $balanceBefore;

            $transactionType = $faker->randomElement($types);
            $status = $faker->randomElement(['success', 'failed', 'pending']);

            $amount = $faker->randomFloat(2, 100, 5000);
            $transactionable = null;
            $description = 'Test transaction';
            $reference = 'TX-' . Str::uuid();
            $apiReference = 'API-' . Str::uuid();
            $apiResponse = $status === 'success' ? 'Transaction successful' : 'Transaction ' . $status;

            switch ($transactionType) {
                case 'data':
                    if (empty($mobileNetworkIds) || empty($dataPlanIds)) {
                        continue 2;
                    }

                    $transactionable = DataTransaction::create([
                        'mobile_network_id' => $faker->randomElement($mobileNetworkIds),
                        'data_plan_id' => $faker->randomElement($dataPlanIds),
                        'phone_number' => $faker->numerify('080########'),
                        'beneficiary_name' => $faker->name(),
                    ]);
                    $description = $transactionable->description;
                    break;

                case 'airtime':
                    if (empty($mobileNetworkIds)) {
                        continue 2;
                    }

                    $transactionable = AirtimeTransaction::create([
                        'mobile_network_id' => $faker->randomElement($mobileNetworkIds),
                        'amount' => $amount,
                        'phone_number' => $faker->numerify('080########'),
                    ]);
                    $description = $transactionable->description;
                    break;

                case 'cable':
                    if (empty($cableNetworkIds) || empty($cablePlanIds)) {
                        continue 2;
                    }

                    $cableNetworkId = $faker->randomElement($cableNetworkIds);
                    $cablePlanId = $faker->randomElement($cablePlanIds);
                    $smartCard = $faker->numerify('##########');
                    $customerName = $faker->name();

                    $transactionable = CableSubscriptionTransaction::create([
                        'cable_network_id' => $cableNetworkId,
                        'cable_subscription_plan_id' => $cablePlanId,
                        'smart_card_number' => $smartCard,
                        'name' => $customerName,
                        'phone_number' => $faker->numerify('080########'),
                    ]);
                    $planName = CableSubscriptionPlan::find($cablePlanId)?->package_name ?? 'Cable Plan';
                    $networkName = CableNetwork::find($cableNetworkId)?->name ?? 'Cable Network';
                    $description = "{$planName} ({$amount}) {$networkName} Cable Subscription to {$smartCard} ({$customerName})";
                    break;

                case 'electricity':
                    if (empty($electricityDistributorIds)) {
                        continue 2;
                    }

                    $distributorId = $faker->randomElement($electricityDistributorIds);
                    $meterNumber = $faker->numerify('##########');
                    $customerName = $faker->name();

                    $transactionable = ElectricityBillTransaction::create([
                        'electricity_distributor_id' => $distributorId,
                        'meter_number' => $meterNumber,
                        'meter_type' => $faker->randomElement(['prepaid', 'postpaid']),
                        'name' => $customerName,
                        'phone_number' => $faker->numerify('080########'),
                        'address' => $faker->address(),
                        'token' => $faker->optional()->numerify('################'),
                    ]);
                    $distributorName = ElectricityDistributor::find($distributorId)?->name ?? 'Distributor';
                    $description = "{$amount} {$distributorName} Bill Payment to {$meterNumber} ({$customerName})";
                    break;

                case 'result_checker':
                    if ($examTypes->isEmpty()) {
                        continue 2;
                    }

                    $examType = $examTypes->random();
                    $transactionable = ResultCheckerTransaction::create([
                        'exam_type_id' => $examType->id,
                        'exam_type' => $examType->name,
                        'quantity' => $faker->numberBetween(1, 3),
                        'pins' => json_encode([
                            $faker->numerify('############'),
                            $faker->numerify('############'),
                        ]),
                    ]);
                    $description = 'Result checker purchase';
                    break;

                case 'wallet':
                default:
                    $walletType = $faker->randomElement(['credit', 'debit']);
                    $transactionable = WalletTransaction::create([
                        'user_id' => $user->id,
                        'wallet_id' => $wallet->id,
                        'type' => $walletType,
                        'amount' => $amount,
                        'note' => $faker->sentence(6),
                        'method' => $faker->randomElement(['card', 'bank', 'transfer']),
                        'payment_gateway' => $faker->randomElement(['paystack', 'flutterwave', 'monnify']),
                    ]);
                    $description = ucfirst($walletType) . ' wallet test transaction';
                    break;
            }

            if ($status === 'success') {
                if ($transactionType === 'wallet' && isset($walletType)) {
                    $balanceAfter = $walletType === 'credit'
                        ? $balanceBefore + $amount
                        : max(0, $balanceBefore - $amount);
                } else {
                    $balanceAfter = max(0, $balanceBefore - $amount);
                }

                $wallet->update(['balance' => $balanceAfter]);
            }

            $transactionable->transaction()->create([
                'user_id' => $user->id,
                'description' => $description,
                'transactionable_id' => $transactionable->id,
                'transactionable_type' => $transactionable::class,
                'balance_before' => (string) $balanceBefore,
                'balance_after' => (string) $balanceAfter,
                'api_response' => $apiResponse,
                'reference' => $reference,
                'api_reference' => $apiReference,
                'request_ip' => $faker->ipv4(),
                'status' => $status,
                'amount' => $amount,
            ]);
        }
    }
}
