<?php

namespace Database\Seeders;

use App\Models\CableNetwork;
use App\Models\ElectricityDistributor;
use App\Models\MobileNetwork;
use App\Models\UserPackage;
use Illuminate\Database\Seeder;

class UserPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Data Discount
        $networks = MobileNetwork::all();
        $cable_networks = CableNetwork::all();
        $e_distributors = ElectricityDistributor::all();
        $packages = UserPackage::all();


        foreach ($networks as $planType) {

            foreach ($packages as $package) {
                $planType->addon()->create([
                        "type"=> 'discount',
                        "amount_type"=> 'percentage',
                        "amount"=> 0,
                        "user_package_id"=> $package->id,
                ]);

            }

        }



        foreach ($cable_networks as $cable_network) {

            foreach ($packages as $package) {
                $cable_network->addon()->create([
                        "type"=> 'charge',
                        "amount_type"=> 'fixed',
                        "amount"=> 0,
                        "user_package_id"=> $package->id,
                ]);

            }
        }

        foreach ($e_distributors as $distributor) {

            foreach ($packages as $package) {
                $distributor->addon()->create([
                        "type"=> 'charge',
                        "amount_type"=> 'fixed',
                        "amount"=> 0,
                        "user_package_id"=> $package->id,
                ]);

            }
        }



    }
}
