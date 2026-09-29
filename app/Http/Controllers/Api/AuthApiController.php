<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthUserResource;
use App\Models\User;
use App\Validations\PhoneNumberValidation;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthApiController extends Controller
{
    /**
     * Authenticate mobile user and return Sanctum Bearer token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $login = $request->input('login');
        $password = $request->input('password');

        // Allow logging in via email, username, or phone_number
        $user = User::where('email', $login)
            ->orWhere('username', $login)
            ->orWhere('phone_number', $login)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['Invalid credentials. Please verify your username/email and password.'],
            ]);
        }

        if (isset($user->active) && !$user->active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Your account is deactivated. Please contact support.',
            ], 403);
        }

        // Generate Sanctum Bearer token for mobile
        $token = $user->createToken('mobile_app')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'user' => new AuthUserResource($user),
            'has_pin' => $user->hasTransactionPin(),
            'message' => 'Login successful',
        ]);
    }

    /**
     * Register a new user from mobile app and issue token.
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'phone_number' => [
                'required',
                'string',
                'max:20',
                'unique:' . User::class,
                function ($attribute, $value, $fail) {
                    $result = PhoneNumberValidation::validateNetworkPhoneNumber($value, '', true);
                    if ($result !== true) {
                        $fail($result);
                    }
                },
            ],
            'password' => 'required|string|min:6|confirmed',
        ]);

        $isEmailVerificationEnabled = in_array(config('settings.feat_enable_email_verification'), ['1', 1, 'true', true], true);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone_number' => $request->phone_number,
            'username' => $request->username ?? $request->email,
            'address' => $request->address,
            'email_verified_at' => $isEmailVerificationEnabled ? null : now(),
        ]);

        $user->wallet()->create([
            'balance' => 0,
        ]);

        event(new Registered($user));

        $token = $user->createToken('mobile_app')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'user' => new AuthUserResource($user),
            'has_pin' => false,
            'message' => 'Registration successful',
        ], 201);
    }

    /**
     * Get current authenticated user details.
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'status' => 'success',
            'user' => new AuthUserResource($user),
            'has_pin' => $user->hasTransactionPin(),
        ]);
    }

    /**
     * Set or update transaction PIN.
     */
    public function updatePin(Request $request): JsonResponse
    {
        $user = $request->user();
        $hasPin = $user->hasTransactionPin();

        $rules = [
            'pin' => ['required', 'string', 'digits:4', 'confirmed'],
            'pin_confirmation' => ['required', 'string', 'digits:4'],
        ];

        if ($hasPin) {
            $rules['current_pin'] = ['required', 'string', 'digits:4'];
        }

        $validated = $request->validate($rules);

        if ($hasPin) {
            if (!$user->verifyTransactionPin($validated['current_pin'])) {
                throw ValidationException::withMessages([
                    'current_pin' => ['The current PIN is incorrect.'],
                ]);
            }
        }

        $user->update(['transaction_pin' => $validated['pin']]);

        return response()->json([
            'status' => 'success',
            'message' => $hasPin ? 'Transaction PIN updated successfully.' : 'Transaction PIN created successfully.',
            'has_pin' => true,
        ]);
    }

    /**
     * Revoke active token.
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully',
        ]);
    }
}
