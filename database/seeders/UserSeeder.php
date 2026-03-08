<?php

namespace Database\Seeders;

use App\Models\User;

use App\Models\UserPackage;
use Illuminate\Database\Seeder;
use App\Jobs\CreateVirtualAccount;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $packages = [
            "Smart Earner",
            "Affiliate",
            "Top User",
            "Api"
        ];

        foreach ($packages as $package) {
            UserPackage::create(['name'=> $package, 'daily_spending_limit'=>2000]);
        }


        $admin = User::create([
            'name' => 'Administrator',
            'username' => "master",
            'email' => 'masteradmin@dev.com',
            'password' => Hash::make('Important!'),
            'phone_number' => "08101234567",
            'address' => "Bauchi"
        ]);

        $user = User::create([
            'name' => "Test User",
            'username' => "test-user",
            'email' => "test-user@gmail.com",
            'phone_number' => "09088776655",
            'address' => "Test Address",
            'password' => Hash::make('Pass2444'),
        ]);

        // Create Wallet

        $user->wallet()->create([
            'balance' => 0,
        ]);

        $admin->wallet()->create([
            'balance' => 2000,
        ]);

        // Create Vitual Accounts

        // CreateVirtualAccount::dispatch($admin);

        // CreateVirtualAccount::dispatch($user);

        $usersroles = [
        ['name' => 'Admin'],
        ['name' => 'User'],
        ];

        $role = Role::create(['name' => 'Superadmin']);
        $role2 = Role::create(['name' => 'Masteradmin']);

        $permissions = Permission::pluck('id','id')->all();

        $role2->syncPermissions($permissions);

        $role->syncPermissions($permissions);

        $admin->assignRole([$role2->id]);

        foreach ($usersroles as $role) {
            Role::create($role);
        }

        $admin->assignRole("Admin");






    }
}
