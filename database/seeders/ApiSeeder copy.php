<?php

namespace Database\Seeders;

use App\Models\TransactionApi;
use Illuminate\Database\Seeder;

class ApiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $apis = [
            [
                'name'=> "Default",
                'url'=> 'https://opendatasub.com',
                'model'=> 'APIs\\Default\\',
                'token'=> "98323hjdshdshjsdhshdhjdhjhjs",
                'username'=> 'username',
                'password'=> 'password',
                'mtn_service_id'=> 1,
                'airtel_service_id'=> 2,
                'glo_service_id'=> 3,
                'ninemobile_service_id'=> 4,
            ],
            [
                'name'=> "ADE",
                'url'=> 'https://opendatasub.com',
                'model'=> 'APIs\\ADE\\',
                'token'=> "98323hjdshdshjsdhshdhjdhjhjs",
                'username'=> 'username',
                'password'=> 'password',
                'mtn_service_id'=> 1,
                'airtel_service_id'=> 2,
                'glo_service_id'=> 3,
                'ninemobile_service_id'=> 4,
            ],  [
                'name'=> "Smart Tech API",
                'url'=> 'https://topify.ng',
                'model'=> 'APIs\\SmartTech\\',
                'token'=> "b6CKGOsJkhO2tlQuzS6BXdHFrmEftPpLYkzZfPoR",
                'username'=> 'username',
                'password'=> 'password',
                'mtn_service_id'=> 1,
                'airtel_service_id'=> 2,
                'glo_service_id'=> 3,
                'ninemobile_service_id'=> 4,
            ],
            [
                'name'=> "Autofy",
                'url'=> 'https://autofy.ng',
                'model'=> 'APIs\\Autofy\\',
                'token'=> "b6CKGOsJkhO2tlQuzS6BXdHFrmEftPpLYkzZfPoR",
                'username'=> 'username',
                'password'=> 'password',
                'mtn_service_id'=> 1,
                'airtel_service_id'=> 2,
                'glo_service_id'=> 3,
                'ninemobile_service_id'=> 4,
            ],
            [
                'name'=> "VtPass",
                'url'=> 'https://vtpass.com',
                'model'=> 'APIs\\VtPass\\',
                'token'=> "98323hjdshdshjsdhshdhjdhjhjs",
                'username'=> 'username',
                'password'=> 'password',
                'mtn_service_id'=> 1,
                'airtel_service_id'=> 2,
                'glo_service_id'=> 3,
                'ninemobile_service_id'=> 4,
            ]

        ];



        foreach ($apis as $api) {

            TransactionApi::create($api);

        }



    }
}
