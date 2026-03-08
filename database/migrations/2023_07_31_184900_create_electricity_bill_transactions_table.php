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
        Schema::create('electricity_bill_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('electricity_distributor_id');
            $table->string('meter_number');
            $table->string('meter_type');
            $table->string('name');
            $table->string('phone_number');
            $table->string('address');
            $table->string('token')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('electricity_bill_transactions');
    }
};
