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
        Schema::create('transaction_addons', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['discount', 'charge']); // Type of pricing: discount or charge
            $table->decimal('amount', 10, 2); // Amount of discount or charge
            $table->enum('amount_type', ['percentage', 'fixed']); // Type of amount: percentage or fixed
            $table->unsignedBigInteger('user_package_id'); // Foreign key referencing user ranks
            $table->bigInteger('addonable_id');
            $table->string('addonable_type');
            $table->boolean('active')->default(1);
            // You can add more columns as needed
            $table->timestamps();

            // Add foreign key constraint
            $table->foreign('user_package_id')->references('id')->on('user_packages');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_addons');
    }
};
