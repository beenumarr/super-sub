<?php

namespace Database\Seeders;

use App\Models\ElectricityDistributor;
use App\Models\ExamType;
use Illuminate\Database\Seeder;

class ExamTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {



        $exam_types = [
            ['name' => "WAEC", "transaction_api_id" => 1, 'amount'=> 1000],
            ['name' => "NECO", "transaction_api_id" => 1, 'amount'=> 500],
            ['name' => "NABTEB", "transaction_api_id" => 1, 'amount'=> 800],
        ];

        foreach ($exam_types as $item) {

             ExamType::create($item);

        }


    }
}
