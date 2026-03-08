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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('vending_medium')->nullable();
            $table->string('transaction_channel')->nullable();
            $table->string('reference');
            $table->string('api_reference')->nullable();
            $table->decimal('amount', 16, 2);
            $table->bigInteger('transactionable_id');
            $table->bigInteger('transaction_api_id')->nullable();
            $table->string('transactionable_type');
            $table->string('balance_before')->nullable();
            $table->string('balance_after')->nullable();
            $table->string('api_response')->nullable();
            $table->string('request_ip')->nullable();
            $table->string('description')->nullable();
            $table->enum('status', ['failed','success','pending','refunded'])->default('pending');
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->unique('reference');
            $table->unique('api_reference');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
