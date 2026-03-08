<?php

namespace Database\Seeders;

use App\Models\User;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {


        $admin = User::where('email', 'masteradmin@dev.com')->first();

        if($admin){

            $usersroles = [
                ['name' => 'Admin', 'guard_name' => 'web'],
                ['name' => 'User', 'guard_name' => 'web'],
                ];

                $role = Role::create(['name' => 'Superadmin', 'guard_name' => 'web']);

                $permissions = Permission::pluck('id','id')->all();

                $role->syncPermissions($permissions);

                $admin->assignRole([$role->id]);

                foreach ($usersroles as $role) {
                    Role::create($role);
                }

                $admin->assignRole("Admin");

        }



    }
}
