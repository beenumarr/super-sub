<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('data_plans', function (Blueprint $table) {
            $columnsToDrop = array_filter([
                'smart_earner_amount',
                'affiliate_amount',
                'top_user_amount',
                'api_amount',
            ], fn ($column) => Schema::hasColumn('data_plans', $column));

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data_plans', function (Blueprint $table) {
            if (!Schema::hasColumn('data_plans', 'smart_earner_amount')) {
                $table->decimal('smart_earner_amount', 16, 2)->nullable();
            }
            if (!Schema::hasColumn('data_plans', 'affiliate_amount')) {
                $table->decimal('affiliate_amount', 16, 2)->nullable();
            }
            if (!Schema::hasColumn('data_plans', 'top_user_amount')) {
                $table->decimal('top_user_amount', 16, 2)->nullable();
            }
            if (!Schema::hasColumn('data_plans', 'api_amount')) {
                $table->decimal('api_amount', 16, 2)->nullable();
            }
        });
    }
};

