<?php

namespace App\Actions\Auth;

use App\Models\User;
use App\Jobs\CreateVirtualAccount;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;

class RegisterUser
{


    public function handle($data)
    {

        $user = User::create([
            'name' => $data['name'],
            'username' => $data['email'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'address' => $data['address'],
            'password' => Hash::make($data['password']),
        ]);

        // Create Wallet

        $user->wallet()->create([
            'balance' => 0,
        ]);

        // Create Vitual Accounts

        CreateVirtualAccount::dispatch($user);

        event(new Registered($user));

        return $user;

    }


}
