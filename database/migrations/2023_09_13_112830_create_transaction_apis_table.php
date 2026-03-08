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
        Schema::create('transaction_apis', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->string('model');
            $table->string('service_type')->nullable();
            $table->string('token')->nullable();
            $table->string('secret_key')->nullable();
            $table->string('public_key')->nullable();
            $table->string('username')->nullable();
            $table->string('password')->nullable();
            $table->integer('mtn_service_id')->nullable();
            $table->integer('airtel_service_id')->nullable();
            $table->integer('glo_service_id')->nullable();
            $table->integer('ninemobile_service_id')->nullable();
            $table->integer('other_service_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_apis');
    }
};
