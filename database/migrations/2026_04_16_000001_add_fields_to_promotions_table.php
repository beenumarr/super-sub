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
        Schema::table('promotions', function (Blueprint $table) {
            $table->string('code')->unique()->after('id');
            $table->decimal('reward_amount', 16, 2)->after('code');
            $table->unsignedInteger('max_redemptions')->after('reward_amount');
            $table->unsignedInteger('redeemed_count')->default(0)->after('max_redemptions');
            $table->boolean('is_active')->default(false)->after('redeemed_count');
            $table->timestamp('starts_at')->nullable()->after('is_active');
            $table->timestamp('ends_at')->nullable()->after('starts_at');
            $table->unsignedBigInteger('created_by')->nullable()->after('ends_at');

            $table->index(['is_active', 'starts_at', 'ends_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->dropIndex(['is_active', 'starts_at', 'ends_at']);
            $table->dropColumn([
                'code',
                'reward_amount',
                'max_redemptions',
                'redeemed_count',
                'is_active',
                'starts_at',
                'ends_at',
                'created_by',
            ]);
        });
    }
};

