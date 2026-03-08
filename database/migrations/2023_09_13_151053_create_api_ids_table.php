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
        Schema::create('api_ids', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('apiable_id');
            $table->string('apiable_type');
            $table->bigInteger('product_id');
            $table->string('product_code')->nullable();
            $table->unsignedBigInteger('transaction_api_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_ids');
    }
};
