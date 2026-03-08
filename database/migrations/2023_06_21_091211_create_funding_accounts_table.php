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
        Schema::create('funding_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('funding_bank_id')->nullable();
            $table->string('bank_code');
            $table->string('bank_name');
            $table->string('account_name');
            $table->string('gateway')->nullable();
            $table->string('account_type')->nullable();
            $table->string('expire_date')->nullable();
            $table->string('account_number');
            $table->string('reference')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funding_accounts');
    }
};
