<?php

namespace Database\Seeders;

use App\Models\ElectricityDistributor;
use Illuminate\Database\Seeder;

class ElectricityDistributorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $electricity_distributors = [
            ['name' => "Jos Electric", 'code' => "jos-electric", "api_id" => 9 ],
            ['name' => "Kano Electric", 'code' => "kano-electric", "api_id" => 4 ],
            ['name' => "Ikeja Electric", 'code' => "ikeja-electric", "api_id" => 1 ],
            ['name' => "Eko Electric", 'code' => "eko-electric", "api_id" => 2 ],
            ['name' => "Abuja Electric", 'code' => "abuja-electric", "api_id" => 3 ],
            ['name' => "Enugu Electric", 'code' => "enugu-electric", "api_id" => 5 ],
            ['name' => "Port Harcourt Electric", 'code' => "port-harcourt-electric", "api_id" => 6 ],
            ['name' => "Ibadan Electric", 'code' => "ibadan-electric", "api_id" => 7 ],
            ['name' => "Kaduna Electric", 'code' => "kaduna-electric", "api_id" => 8 ],
            ['name' => "Benin Electric", 'code' => "benin-electric", "api_id" => 10 ],
            ['name' => "Yola Electric", 'code' => "yola-electric", "api_id" => 11 ],
        ];

        foreach ($electricity_distributors as $disco) {

             ElectricityDistributor::create($disco);

        }


    }
}
