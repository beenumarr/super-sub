<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $permissions = [

            'View Role',
            'Create Role',
            'Edit Role',
            'Delete Role',

            'View User',
            'Create User',
            'Edit User',
            'Delete User',

            'View Staff',
            'Create Staff',
            'Edit Staff',
            'Delete Staff',

            'User Wallet Funding',
            'View Transaction',
            'Update Transaction',

            'View Service Management',
            'Update Service Management',

            'View Data Plan',
            'Create Data Plan',
            'Edit Data Plan',
            'Delete Data Plan',
            'View Analytics',

            'View Data Type',
            'Create Data Type',
            'Edit Data Type',
            'Delete Data Type',

            'View Cable Plan',
            'Create Cable Plan',
            'Edit Cable Plan',
            'Delete Cable Plan',

            'View Service Charge',
            'Update Service Charge',
            'View Airtime to Cash',
            'Update Airtime to Cash Settings',



            'View Site Configurations',
            'Update Site Configurations',



        ];

        foreach ($permissions as $permission) {
             Permission::create(['name' => strtolower(str_replace(" ", "_", $permission)), 'title' => $permission, 'guard_name' => 'web']);
        }
    }
}
