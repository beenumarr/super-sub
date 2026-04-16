<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // This is intentionally opt-in to avoid accidental data loss in a single deploy.
        // Run with: `DROP_LEGACY_TRANSACTION_TABLES=1 php artisan migrate`
        if (env('DROP_LEGACY_TRANSACTION_TABLES') !== '1') {
            return;
        }

        Schema::dropIfExists('bonus_wallet_transactions');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('result_checker_transactions');
        Schema::dropIfExists('electricity_transactions');
        Schema::dropIfExists('electricity_bill_transactions');
        Schema::dropIfExists('cable_subscription_transactions');
        Schema::dropIfExists('airtime_transactions');
        Schema::dropIfExists('data_transactions');

        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'transactionable_id')) {
                $table->dropColumn('transactionable_id');
            }
            if (Schema::hasColumn('transactions', 'transactionable_type')) {
                $table->dropColumn('transactionable_type');
            }
        });
    }

    public function down(): void
    {
        // Intentionally left blank. Restoring dropped legacy tables/columns should be
        // done by rolling back to a prior release/migration set.
    }
};
