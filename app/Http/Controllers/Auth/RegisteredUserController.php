<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Validations\PhoneNumberValidation;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create()
    {
        // return back()->with('status', 'Registration is currently not available');

        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Registration is currently disabled
        // abort(403, 'Registration is currently not available');



        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone_number' => [
                'required',
                'string',
                'max:20',
                'unique:'.User::class,
                function ($attribute, $value, $fail) {
                    $result = PhoneNumberValidation::validateNetworkPhoneNumber($value, '', true);
                    if ($result !== true) {
                        $fail($result);
                    }
                },
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone_number' => $request->phone_number,

            'username' => $request->email,
            'address' => $request->address,
        ]);


        $user->wallet()->create([
            'balance' => 0,
        ]);


        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');

    }
}
