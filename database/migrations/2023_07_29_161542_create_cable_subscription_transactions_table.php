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
        Schema::create('cable_subscription_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cable_network_id');
            $table->unsignedBigInteger('cable_subscription_plan_id');
            $table->string('smart_card_number');
            $table->string('name')->nullable();
            $table->string('phone_number')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cable_subscription_transactions');
    }
};
