<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Make the legacy 'reference' field nullable since new code uses 'reference_id'
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('transactions', function (Blueprint $table) {
                $table->string('reference', 255)->nullable()->change();
            });
        } else {
            DB::statement("ALTER TABLE `transactions` MODIFY `reference` VARCHAR(255) NULL");
        }
    }

    public function down(): void
    {
        // Revert to NOT NULL
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('transactions', function (Blueprint $table) {
                $table->string('reference', 255)->nullable(false)->change();
            });
        } else {
            DB::statement("ALTER TABLE `transactions` MODIFY `reference` VARCHAR(255) NOT NULL");
        }
    }
};
