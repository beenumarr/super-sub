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
        Schema::create('mobile_networks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transaction_api_id')->nullable();
            $table->string('name');
            $table->string('code')->nullable();
            $table->integer('api_network_id');
            $table->integer('airtime_transaction_api_id')->nullable();
            $table->boolean('data_active')->default(1);
            $table->boolean('airtime_active')->default(1);
            $table->boolean('airtime_to_cash_active')->default(false);
            $table->integer('airtime_to_cash_limit')->default(0);
            $table->integer('a2c_conversion_rate')->default(90);
            $table->string('airtime_to_cash_api_id')->nullable();
            $table->boolean('a2c_auto_method_enabled')->default(0);
            $table->boolean('a2c_manual_method_enabled')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mobile_networks');
    }
};
