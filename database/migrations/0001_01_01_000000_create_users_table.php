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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username');
            $table->string('api_key')->unique()->nullable();
            $table->string('phone_number');
            $table->boolean('active')->default(1);
            $table->string('referal_username')->nullable();
            $table->dateTime('last_login')->nullable();
            $table->string('photo')->nullable();
            $table->string('address')->nullable();
            $table->string('email')->unique();
            $table->string('bvn')->nullable();
            $table->string('nin')->nullable();
            $table->timestamp('kyc_verified_at')->nullable();
            $table->timestamp('account_reference')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('api_token')->unique()->nullable();
            $table->string('original_token')->unique()->nullable();
            $table->string('transaction_pin')->nullable();
            $table->unsignedBigInteger('user_package_id')->default(1);
            $table->string('last_login_ip')->nullable();
            $table->boolean('enable_api')->default(0);
            $table->string('account_status')->nullable();
            $table->enum('kyc_level', ['basic', 'level1', 'level2', 'level3'])->default('basic');
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_name')->nullable();
            $table->string('bank_account_bank')->nullable();
            $table->string('bank_account_bank_code')->nullable();
            $table->foreignId('user_category_id')->nullable()->constrained('user_categories')->nullOnDelete();
            $table->rememberToken();

            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
