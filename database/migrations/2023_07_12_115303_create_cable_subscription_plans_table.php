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
        Schema::create('cable_subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cable_network_id');
            $table->string('product_code');
            $table->string('validity');
            $table->string('package_name');
            $table->decimal('amount', 16, 2);
            $table->boolean('active')->default(1);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cable_subscription_plans');
    }
};
