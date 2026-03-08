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
        Schema::create('data_plan_types', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mobile_network_id');
            $table->unsignedBigInteger('transaction_api_id')->nullable();
            $table->string('name');
            $table->string('code');
            $table->boolean('active')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_plan_types');
    }
};
