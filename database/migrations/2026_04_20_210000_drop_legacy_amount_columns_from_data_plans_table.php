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
            $table->dropColumn([
                'smart_earner_amount',
                'affiliate_amount',
                'top_user_amount',
                'api_amount',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data_plans', function (Blueprint $table) {
            $table->decimal('smart_earner_amount', 16, 2)->nullable();
            $table->decimal('affiliate_amount', 16, 2)->nullable();
            $table->decimal('top_user_amount', 16, 2)->nullable();
            $table->decimal('api_amount', 16, 2)->nullable();
        });
    }
};
