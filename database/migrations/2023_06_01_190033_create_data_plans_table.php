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
        Schema::create('data_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('data_plan_type_id');
            $table->float('size');
            $table->integer('api_plan_id');
            $table->enum('volume', ['gb','mb']);
            $table->string('validity');
            $table->integer('numeric_value');
            $table->decimal('amount', 16, 2);
            $table->decimal('smart_earner_amount', 16, 2)->nullable();
            $table->decimal('affiliate_amount', 16, 2)->nullable();
            $table->decimal('top_user_amount', 16, 2)->nullable();
            $table->decimal('api_amount', 16, 2)->nullable();
            $table->integer('custom_api_vending_id')->nullable();
            $table->boolean('enable_custom_vending_api')->default(0);
            $table->boolean('active')->default(1);
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('data_plan_type_id')->references('id')->on('data_plan_types')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_plans');
    }
};
