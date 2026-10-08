<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\TransactionApi;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        TransactionApi::firstOrCreate(
            ['name' => 'Accelerate'],
            [
                'model' => 'APIs\\Accelerate\\',
                'url' => 'https://prod.airtime-data.irechargetech.com/api/v2',
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        TransactionApi::where('name', 'Accelerate')->delete();
    }
};
