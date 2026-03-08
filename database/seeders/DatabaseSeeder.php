<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\CableNetwork;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);




        $this->call(DataPlanSeeder::class);
        $this->call(PermissionSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(AppConfigurationSeeder::class);
        $this->call(CablePlanSeeder::class);
        $this->call(ElectricityDistributorSeeder::class);
        $this->call(ExamTypesSeeder::class);
        $this->call(FundingMethodSeeder::class);
        $this->call(UserPackageSeeder::class);
        $this->call(ApiSeeder::class);

    }
}
