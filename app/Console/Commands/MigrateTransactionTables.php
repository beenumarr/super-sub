<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class MigrateTransactionTables extends Command
{
    protected $signature = 'transactions:backfill-central {--chunk=500} {--dry-run}';

    protected $description = 'Backfill centralized transaction columns (type/provider_*/metadata/reference_id) from legacy polymorphic transaction tables';

    public function handle(): int
    {
        if (!Schema::hasTable('transactions')) {
            $this->error('Missing `transactions` table.');
            return self::FAILURE;
        }

        $chunk = (int) $this->option('chunk');
        $dryRun = (bool) $this->option('dry-run');

        $hasLegacyPolymorph = Schema::hasColumn('transactions', 'transactionable_type')
            && Schema::hasColumn('transactions', 'transactionable_id');

        if (!$hasLegacyPolymorph) {
            $this->warn('Legacy polymorphic columns not found. Nothing to backfill from.');
        }

        $this->info('Backfilling transactions in chunks of ' . $chunk . ($dryRun ? ' (dry-run)' : ''));

        $updated = 0;
        $scanned = 0;

        DB::table('transactions')
            ->orderBy('id')
            ->select([
                'id',
                'user_id',
                'reference_id',
                'reference',
                'api_reference',
                'status',
                'type',
                'provider_name',
                'provider_id',
                'provider_reference',
                'product_id',
                'product_category',
                'metadata',
                'transactionable_type',
                'transactionable_id',
            ])
            ->chunkById($chunk, function ($rows) use (&$updated, &$scanned, $dryRun, $hasLegacyPolymorph) {
                foreach ($rows as $row) {
                    $scanned++;

                    $updates = [];

                    // reference_id
                    if (Schema::hasColumn('transactions', 'reference_id') && empty($row->reference_id ?? null)) {
                        if (!empty($row->reference)) {
                            $updates['reference_id'] = $row->reference;
                        }
                    }

                    // provider_reference
                    if (Schema::hasColumn('transactions', 'provider_reference') && empty($row->provider_reference ?? null)) {
                        if (!empty($row->api_reference)) {
                            $updates['provider_reference'] = $row->api_reference;
                        }
                    }

                    // status normalization
                    if (!empty($row->status)) {
                        $normalizedStatus = Str::upper((string) $row->status);
                        if ($normalizedStatus !== $row->status) {
                            $updates['status'] = $normalizedStatus;
                        }
                    }

                    // type derivation from legacy morph
                    $type = $row->type ? Str::upper((string) $row->type) : null;
                    if (!$type && $hasLegacyPolymorph && !empty($row->transactionable_type)) {
                        $type = $this->mapLegacyMorphToType((string) $row->transactionable_type);
                        if ($type) {
                            $updates['type'] = $type;
                        }
                    }

                    // metadata/provider/product backfill only when missing
                    $metadataMissing = Schema::hasColumn('transactions', 'metadata') && empty($row->metadata);
                    $providerMissing = empty($row->provider_id) || empty($row->provider_name);

                    if (($metadataMissing || $providerMissing) && $type && $hasLegacyPolymorph) {
                        $backfilled = $this->backfillFromLegacyTable(
                            $type,
                            (string) ($row->transactionable_type ?? ''),
                            (int) ($row->transactionable_id ?? 0)
                        );

                        if ($metadataMissing && isset($backfilled['metadata'])) {
                            $updates['metadata'] = json_encode($backfilled['metadata']);
                        }

                        foreach (['provider_id', 'provider_name', 'product_id', 'product_category'] as $k) {
                            if (Schema::hasColumn('transactions', $k) && empty($row->{$k}) && isset($backfilled[$k])) {
                                $updates[$k] = $backfilled[$k];
                            }
                        }
                    }

                    if (empty($updates)) {
                        continue;
                    }

                    if (!$dryRun) {
                        DB::table('transactions')->where('id', $row->id)->update($updates);
                    }

                    $updated++;
                }
            });

        $this->info("Scanned: {$scanned}, updated: {$updated}");

        return self::SUCCESS;
    }

    private function mapLegacyMorphToType(string $morph): ?string
    {
        return match ($morph) {
            'App\\Models\\DataTransaction' => 'DATA',
            'App\\Models\\AirtimeTransaction' => 'AIRTIME',
            'App\\Models\\CableSubscriptionTransaction' => 'CABLE',
            'App\\Models\\ElectricityBillTransaction',
            'App\\Models\\ElectricityTransaction' => 'ELECTRICITY',
            'App\\Models\\ResultCheckerTransaction' => 'RESULT_CHECKER',
            'App\\Models\\WalletTransaction' => 'WALLET',
            'App\\Models\\BonusWalletTransaction' => 'BONUS_WALLET',
            default => null,
        };
    }

    /**
     * Returns: ['metadata' => array, 'provider_id' => string, 'provider_name' => string, 'product_id' => string, 'product_category' => string]
     */
    private function backfillFromLegacyTable(string $type, string $legacyMorph, int $legacyId): array
    {
        if ($legacyId <= 0) {
            return [];
        }

        return match ($type) {
            'DATA' => $this->backfillData($legacyId),
            'AIRTIME' => $this->backfillAirtime($legacyId),
            'CABLE' => $this->backfillCable($legacyId),
            'ELECTRICITY' => $this->backfillElectricity($legacyId),
            'RESULT_CHECKER' => $this->backfillResultChecker($legacyId),
            'WALLET' => $this->backfillWallet($legacyId),
            'BONUS_WALLET' => $this->backfillBonusWallet($legacyId),
            default => [],
        };
    }

    private function backfillData(int $id): array
    {
        if (!Schema::hasTable('data_transactions')) {
            return [];
        }

        $row = DB::table('data_transactions')->where('id', $id)->first();
        if (!$row) {
            return [];
        }

        $network = Schema::hasTable('mobile_networks')
            ? DB::table('mobile_networks')->where('id', $row->mobile_network_id)->first()
            : null;

        return [
            'provider_id' => (string) $row->mobile_network_id,
            'provider_name' => $network->name ?? null,
            'product_id' => (string) $row->data_plan_id,
            'product_category' => 'DATA',
            'metadata' => [
                'beneficiary' => $row->phone_number ?? null,
                'network_id' => $row->mobile_network_id ?? null,
                'network' => $network->name ?? null,
                'plan_id' => $row->data_plan_id ?? null,
            ],
        ];
    }

    private function backfillAirtime(int $id): array
    {
        if (!Schema::hasTable('airtime_transactions')) {
            return [];
        }

        $row = DB::table('airtime_transactions')->where('id', $id)->first();
        if (!$row) {
            return [];
        }

        $network = Schema::hasTable('mobile_networks')
            ? DB::table('mobile_networks')->where('id', $row->mobile_network_id)->first()
            : null;

        return [
            'provider_id' => (string) $row->mobile_network_id,
            'provider_name' => $network->name ?? null,
            'product_category' => 'AIRTIME',
            'metadata' => [
                'beneficiary' => $row->phone_number ?? null,
                'network_id' => $row->mobile_network_id ?? null,
                'network' => $network->name ?? null,
                'requested_amount' => $row->amount ?? null,
            ],
        ];
    }

    private function backfillCable(int $id): array
    {
        if (!Schema::hasTable('cable_subscription_transactions')) {
            return [];
        }

        $row = DB::table('cable_subscription_transactions')->where('id', $id)->first();
        if (!$row) {
            return [];
        }

        $network = Schema::hasTable('cable_networks')
            ? DB::table('cable_networks')->where('id', $row->cable_network_id)->first()
            : null;

        $plan = Schema::hasTable('cable_subscription_plans')
            ? DB::table('cable_subscription_plans')->where('id', $row->cable_subscription_plan_id)->first()
            : null;

        return [
            'provider_id' => (string) $row->cable_network_id,
            'provider_name' => $network->name ?? null,
            'product_id' => (string) $row->cable_subscription_plan_id,
            'product_category' => 'CABLE',
            'metadata' => [
                'beneficiary' => $row->smart_card_number ?? null,
                'smart_card_number' => $row->smart_card_number ?? null,
                'name' => $row->name ?? null,
                'phone_number' => $row->phone_number ?? null,
                'network_id' => $row->cable_network_id ?? null,
                'network' => $network->name ?? null,
                'plan_id' => $row->cable_subscription_plan_id ?? null,
                'plan_name' => $plan->package_name ?? null,
                'product_code' => $plan->product_code ?? null,
            ],
        ];
    }

    private function backfillElectricity(int $id): array
    {
        if (Schema::hasTable('electricity_bill_transactions')) {
            $row = DB::table('electricity_bill_transactions')->where('id', $id)->first();
            if (!$row) {
                return [];
            }

            $distributor = Schema::hasTable('electricity_distributors')
                ? DB::table('electricity_distributors')->where('id', $row->electricity_distributor_id)->first()
                : null;

            return [
                'provider_id' => (string) $row->electricity_distributor_id,
                'provider_name' => $distributor->name ?? null,
                'product_category' => 'ELECTRICITY',
                'metadata' => [
                    'beneficiary' => $row->meter_number ?? null,
                    'electricity_distributor_id' => $row->electricity_distributor_id ?? null,
                    'distributor' => $distributor->name ?? null,
                    'meter_number' => $row->meter_number ?? null,
                    'meter_type' => $row->meter_type ?? null,
                    'name' => $row->name ?? null,
                    'phone_number' => $row->phone_number ?? null,
                    'address' => $row->address ?? null,
                    'token' => $row->token ?? null,
                ],
            ];
        }

        // Fallback: old `electricity_transactions` table (limited info)
        if (Schema::hasTable('electricity_transactions')) {
            $row = DB::table('electricity_transactions')->where('id', $id)->first();
            if (!$row) {
                return [];
            }

            return [
                'product_category' => 'ELECTRICITY',
                'metadata' => [
                    'beneficiary' => $row->meter_number ?? null,
                    'meter_number' => $row->meter_number ?? null,
                    'meter_type' => $row->meter_type ?? null,
                    'disco' => $row->disco ?? null,
                    'account_name' => $row->account_name ?? null,
                    'plan' => $row->plan ?? null,
                ],
            ];
        }

        return [];
    }

    private function backfillResultChecker(int $id): array
    {
        if (!Schema::hasTable('result_checker_transactions')) {
            return [];
        }

        $row = DB::table('result_checker_transactions')->where('id', $id)->first();
        if (!$row) {
            return [];
        }

        return [
            'provider_id' => (string) $row->exam_type_id,
            'provider_name' => $row->exam_type ?? null,
            'product_category' => 'RESULT_CHECKER',
            'metadata' => [
                'exam_type_id' => $row->exam_type_id ?? null,
                'exam_type' => $row->exam_type ?? null,
                'quantity' => $row->quantity ?? 1,
                'pins' => $row->pins ? json_decode($row->pins, true) : null,
            ],
        ];
    }

    private function backfillWallet(int $id): array
    {
        if (!Schema::hasTable('wallet_transactions')) {
            return [];
        }

        $row = DB::table('wallet_transactions')->where('id', $id)->first();
        if (!$row) {
            return [];
        }

        return [
            'provider_name' => $row->payment_gateway ?? 'SYSTEM',
            'product_category' => 'WALLET',
            'metadata' => [
                'ledger_type' => $row->type ?? null,
                'method' => $row->method ?? null,
                'payment_gateway' => $row->payment_gateway ?? null,
                'note' => $row->note ?? null,
                'wallet_id' => $row->wallet_id ?? null,
            ],
        ];
    }

    private function backfillBonusWallet(int $id): array
    {
        if (!Schema::hasTable('bonus_wallet_transactions')) {
            return [];
        }

        $row = DB::table('bonus_wallet_transactions')->where('id', $id)->first();
        if (!$row) {
            return [];
        }

        return [
            'provider_name' => 'SYSTEM',
            'product_category' => 'BONUS_WALLET',
            'metadata' => [
                'ledger_type' => $row->type ?? null,
                'method' => $row->method ?? null,
                'wallet_id' => $row->wallet_id ?? null,
                'wallet_type' => 'bonus_balance',
            ],
        ];
    }
}
