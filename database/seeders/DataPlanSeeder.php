<?php

namespace Database\Seeders;

use App\Models\CableNetwork;
use App\Models\DataPlanType;
use App\Models\MobileNetwork;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DataPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mobile_networks = [
            ['name' => "MTN", 'code' => "mtn", "api_network_id"=> 1 ],
            ['name' => "AIRTEL", 'code' => "airtel", "api_network_id"=>4],
            ['name' => "GLO", 'code' => "glo", "api_network_id"=>2],
            ['name' => "9MOBILE", 'code' => "9mobile", "api_network_id"=>3],
        ];



        $data_plan_types = [
            ['name' => "SME", 'code' => "sme", 'transaction_api_id'=> 2],
            ['name' => "GIFTING", 'code' => "gifting", 'transaction_api_id'=> 1],
            ['name' => "SME2", 'code' => "sme2", 'transaction_api_id'=> 1],
            ['name' => "CORPORATE", 'code' => "corporate",'transaction_api_id'=> 1],
            ['name' => "OTHER", 'code' => "other", 'transaction_api_id'=> 1],
        ];

        $data_plan = [
            [
                'size'=> 1.0,
                'api_plan_id' => 1,
                'volume' => "gb",
                'validity'=> 'monthly',
                'numeric_value' => 1000,
                'amount' => 230,
            ], [
                'size'=> 2.0,
                'api_plan_id' => 2,
                'volume' => "gb",
                'validity'=> 'monthly',
                'numeric_value' => 1000,
                'amount' => 530,
            ],[
                'size'=> 3.0,
                'api_plan_id' => 2,
                'volume' => "gb",
                'validity'=> 'monthly',
                'numeric_value' => 1000,
                'amount' => 530,
            ],[
                'size'=> 500,
                'api_plan_id' => 2,
                'volume' => "mb",
                'validity'=> 'monthly',
                'numeric_value' => 1000,
                'amount' => 530,
                ]
        ];




        foreach ($mobile_networks as $network) {

              $mNetwork =  MobileNetwork::create($network);

              $mNetwork->dataPlanTypes()->createMany($data_plan_types);
        }


        $plan_types = DataPlanType::all();

        foreach ($plan_types as $type) {

            $type->dataPlans()->createMany($data_plan);

        }
    }
}
