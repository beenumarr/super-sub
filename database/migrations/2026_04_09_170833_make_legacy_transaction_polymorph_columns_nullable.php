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
        DB::statement("ALTER TABLE `transactions` MODIFY `transactionable_id` BIGINT(20) NULL");
        DB::statement("ALTER TABLE `transactions` MODIFY `transactionable_type` VARCHAR(255) NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE `transactions` MODIFY `transactionable_id` BIGINT(20) NOT NULL");
        DB::statement("ALTER TABLE `transactions` MODIFY `transactionable_type` VARCHAR(255) NOT NULL");
    }
};
