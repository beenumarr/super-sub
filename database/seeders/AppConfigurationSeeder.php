<?php

namespace Database\Seeders;

use App\Models\AppConfiguration;
use App\Models\DataPlanType;
use App\Models\MobileNetwork;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AppConfigurationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $configs = [
            [
                'key' => "monnify_api_key",
                'value' => "YOUR_MONNIFY_API_KEY",
                'type'=> 'text'
            ],
            [
                'key' => "monnify_secret_key",
                'value' => "YOUR_MONNIFY_SECRET_KEY",
                'type'=> 'text'
            ],
            [
                'key' => "monnify_contract_code",
                'value' => "YOUR_MONNIFY_CONTRACT_CODE",
                'type'=> 'text'
            ],
            [
                'key' => "transaction_api_url",
                'value' => "https://smartdatalinks.com",
                'type'=> 'text'
            ],
            [
                'key' => "transaction_api_token",
                'value' => "YOUR_API_TOKEN",
                'type'=> 'text'
            ],

            [
                'key' => "monnify_funding_charges",
                'value' => "1.6 %",
                'type'=> "option",
                'options'=> [
                    ['name'=> "1% (percent)", 'value'=> "1 %"],
                    ['name'=> "2% (percent)", 'value'=> "2 %"],
                    ['name'=> "1.6% (percent)", 'value'=> "1.6 %"],
                    ['name'=> "N50", 'value'=> "50 N"],
                ]
            ],
            [
                'key' => "monnify_api_url",
                'value' => "https://api.monnify.com",
                'type'=> 'text'
            ],
            [
                'key' => "payvessel_api_url",
                'value' => "https://api.payvessel.com",
                'type'=> 'text'
            ],
            [
                'key' => "monnify_marchant_name",
                'value' => "YOUR_MONNIFY_MACHANT_NAME",
                'type'=> 'text'
            ],
            [
                'key' => "site_name",
                'value' => "My Site",
                'type'=> 'text'
            ],
            [
                'key' => "site_notification",
                'value' => "Welcome to My Site",
                'type'=> 'text'
            ],
            [
                'key' => "site_hero_title",
                'value' => "Data is Life",
                'type'=> 'text'
            ],
            [
                'key' => "site_hero_subtitle",
                'value' => "Oya register and buy data nah!",
                'type'=> 'text'
            ],
            [
                'key' => "site_about",
                'value' => "This is My Site",
                'type'=> 'text'
            ],
            [
                'key' => "site_contact_address",
                'value' => "Bauchi, Nigeria",
                'type'=> 'text'
            ],
            [
                'key' => "site_contact_email",
                'value' => "info@mysite.com",
                'type'=> 'text'
            ],
            [
                'key' => "site_contact_number",
                'value' => "+234",
                'type'=> 'text'
            ],
            [
                'key' => "site_primary_color",
                'value' => "theme-2",
                'type'=> 'text'
            ],
            [
                'key' => "transaction_api_authorization",
                'value' => "Bearer",
                'type'=> 'text'
            ],
            [
                'key' => "data_transaction_api",
                'value' => 1,
                'type'=> 'text'
            ],
            [
                'key' => "airtime_transaction_api",
                'value' => 1,
                'type'=> 'text'
            ],
            [
                'key' => "cable_transaction_api",
                'value' => 1,
                'type'=> 'text'
            ],
            [
                'key' => "bill_payment_transaction_api",
                'value' => 1,
                'type'=> 'text'
            ],


        ];


        foreach ($configs as $config) {

          $item =  AppConfiguration::create([
                'key' => $config['key'],
                'value' => $config['value'],
            ]);

            if($config['type'] === 'option'){

                $item->options()->createMany($config['options']);

            }


        }



    }
}
