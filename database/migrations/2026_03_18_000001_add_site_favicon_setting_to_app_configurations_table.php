<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $exists = DB::table('app_configurations')->where('key', 'site_favicon')->exists();

        if (! $exists) {
            DB::table('app_configurations')->insert([
                'key' => 'site_favicon',
                'value' => '',
                'type' => 'text',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('app_configurations')->where('key', 'site_favicon')->delete();
    }
};

