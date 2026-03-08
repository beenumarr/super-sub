<?php

namespace Database\Seeders;

use App\Models\FundingMethod;
use Illuminate\Database\Seeder;

class FundingMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            [
                'name' => "Manual Funding",
                'code' => "manual_funding",
                'type'=> 'card',
                'active'=> true,
            ],
            [
                'name' => "Wallet Transfer",
                'code' => "002",
                'type'=> 'wallet',
                'active'=> true,
            ],
            [
                'name' => "Card Funding",
                'code' => "card_funding",
                'type'=> 'manual',
                'active'=> true,
            ],
            [
                'name' => "Moniepoint Microfinance Bank",
                'code' => "50515",
                'type'=> 'bank',
                'active'=> true,
            ],
            [
                'name' => "Wema Bank",
                'code' => "035",
                'type'=> 'bank',
                'active'=> true,
            ],
            [
                'name' => "Sterling Bank",
                'code' => "232",
                'type'=> 'bank',
                'active'=> true,
            ],
            [
                'name' => "Gt Bank",
                'code' => "058",
                'type'=> 'bank',
                'active'=> true,
            ],
            [
                'name' => "9PAYMENT SERVICE BANK",
                'code' => "120001",
                'type'=> 'bank',
                'active'=> true,
            ],
            [
                'name' => "Wallet Transfer",
                'code' => "002",
                'type'=> 'wallet',
                'active'=> true,
            ],
            [
                'name' => "Airtime to Cash Transfer",
                'code' => "004",
                'type'=> 'wallet',
                'active'=> true,
            ]

        ];


        foreach ($methods as $method) {
            FundingMethod::create($method);
        }



    }
}
