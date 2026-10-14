<?php

use App\Models\TransactionApi;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        TransactionApi::firstOrCreate(
            ['name' => 'Boltnet'],
            [
                'model' => 'APIs\\Boltnet\\',
                'url' => 'https://boltnet.com.ng',
                'mtn_service_id' => 1,
                'airtel_service_id' => 2,
                'glo_service_id' => 3,
                'ninemobile_service_id' => 4,
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        TransactionApi::where('name', 'Boltnet')->delete();
    }
};
