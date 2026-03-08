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
        Schema::create('service_cards', function (Blueprint $table) {
            $table->id();
            $table->string('pin');
            $table->integer('serial');
            $table->enum('status',['used','valid','invalid'])->default('valid');
            $table->string('phone_number_used')->nullable();
            $table->string('user_phone_number')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->dateTime('activation_date')->nullable();
            $table->enum('service_type', ['data','airtime'])->default('data');
            $table->integer('value');
            $table->string('unit')->nullable();
            $table->bigInteger('data_plan_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_cards');
    }
};
