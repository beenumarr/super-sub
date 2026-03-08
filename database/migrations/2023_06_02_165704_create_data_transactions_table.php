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
        Schema::create('data_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mobile_network_id');
            $table->unsignedBigInteger('data_plan_id');
            $table->string('phone_number');
            $table->string('beneficiary_name')->nullable();
            $table->timestamps();

            $table->foreign('mobile_network_id')->references('id')->on('mobile_networks');
            $table->foreign('data_plan_id')->references('id')->on('data_plans');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_transactions');
    }
};
