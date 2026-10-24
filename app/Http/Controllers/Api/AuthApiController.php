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
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
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
        $isEmailVerificationEnabled = in_array(config('settings.feat_enable_email_verification'), ['1', 1, 'true', true], true);
        $needsEmailVerification = $isEmailVerificationEnabled && !$user->hasVerifiedEmail();

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'user' => new AuthUserResource($user),
            'has_pin' => $user->hasTransactionPin(),
            'email_verified' => $user->hasVerifiedEmail(),
            'needs_email_verification' => $needsEmailVerification,
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
        $needsEmailVerification = $isEmailVerificationEnabled && !$user->hasVerifiedEmail();

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'user' => new AuthUserResource($user),
            'has_pin' => false,
            'email_verified' => $user->hasVerifiedEmail(),
            'needs_email_verification' => $needsEmailVerification,
            'message' => 'Registration successful',
        ], 201);
    }

    /**
     * Get current authenticated user details.
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();
        $isEmailVerificationEnabled = in_array(config('settings.feat_enable_email_verification'), ['1', 1, 'true', true], true);

        return response()->json([
            'status' => 'success',
            'user' => new AuthUserResource($user),
            'has_pin' => $user->hasTransactionPin(),
            'email_verified' => $user->hasVerifiedEmail(),
            'needs_email_verification' => $isEmailVerificationEnabled && !$user->hasVerifiedEmail(),
        ]);
    }

    /**
     * Send or resend email verification notification.
     */
    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Your email is already verified.',
                'email_verified' => true,
                'needs_email_verification' => false,
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'status' => 'success',
            'message' => 'Verification link sent to your email address.',
            'email_verified' => false,
            'needs_email_verification' => true,
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
     * Verify transaction/login PIN.
     */
    public function verifyPin(Request $request): JsonResponse
    {
        $request->validate([
            'pin' => ['required', 'string', 'digits:4'],
        ]);

        $user = $request->user();
        if (!$user->verifyTransactionPin($request->input('pin'))) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid PIN. Please try again.',
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'PIN verified successfully.',
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

    /**
     * Send password reset link to user email.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        Password::sendResetLink($request->only('email'));

        return response()->json([
            'status' => 'success',
            'message' => 'A password reset link will be sent if the email exists in our records.',
        ]);
    }

    /**
     * Update user account password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password provided is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password updated successfully.',
        ]);
    }

    /**
     * Update user profile information.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully.',
            'user' => new AuthUserResource($user->fresh()),
        ]);
    }

    /**
     * Delete user account and revoke all tokens.
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The password provided is incorrect.'],
            ]);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($user) {
            $user->tokens()->delete();
            $user->delete();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Your account has been permanently deleted.',
        ]);
    }
}
