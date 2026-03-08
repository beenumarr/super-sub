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
        Schema::create('airtime_to_cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('mobile_network_id');
            $table->decimal('amount', 16, 2);
            $table->string('phone_number');
            $table->string('sessionId');
            $table->string('api_reference')->nullable();
            $table->string('reference');
            $table->text('api_response')->nullable();
            $table->integer('quantity')->default(1);
            $table->integer('success')->default(0);
            $table->enum('status', ['processing', 'completed', 'failed', 'transferred'])->default('processing');
            $table->integer('failed')->default(0);
            $table->integer('unsure')->default(0);
            $table->string('receiver_phone')->nullable();
            $table->boolean('is_manual')->default(false);
            $table->decimal('converted_amount', 16, 2);
            $table->decimal('convertion_rate', 16, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('airtime_to_cash_transactions');
    }
};
