<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'banks' => json_decode(file_get_contents(database_path('res/banks.json')), true),
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = Auth::user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = Auth::user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }


    public function verifyBankAccount(Request $request)
    {
        $request->validate([
            'account_number' => ['required', 'string', 'size:10'],
            'bank_code' => ['required', 'string'],
        ]);

        try {
            $client = new Client();
            $queryParams = [
                'account_number' => $request->account_number,
                'bank_code' => $request->bank_code
            ];

            $response = $client->get('https://nubapi.com/api/verify', [
                'query' => $queryParams,
                'headers' => [
                    'Authorization' => 'Bearer ' . config('services.nubapi.key')
                ],
                'timeout' => 15,
            ]);

            $data = $response->getBody()->getContents();
            Log::debug('Bank verification API response:', ['response' => $data]);

            $data = json_decode($data, true);


            if (isset($data['status']) && $data['status'] === 200) {
                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'account_name' => $data['account_name'] ?? null,
                        'first_name' => $data['first_name'] ?? null,
                        'last_name' => $data['last_name'] ?? null
                    ]
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => $data['message'] ?? 'Failed to verify account'
                ], 400);
            }

        } catch (RequestException $e) {
            Log::error('Bank account verification error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to connect to verification service'
            ], 500);
        }
    }

    public function updateBankAccount(Request $request)
    {
        $request->validate([
            'bank_code' => ['required', 'string'],
            'bank_name' => ['required', 'string'],
            'account_number' => ['required', 'string', 'size:10'],
            'account_name' => ['required', 'string'],
        ]);

        $user = Auth::user();

        $user->update([
            'bank_account_bank_code' => $request->bank_code,
            'bank_account_bank' => $request->bank_name,
            'bank_account_number' => $request->account_number,
            'bank_account_name' => $request->account_name,
        ]);

        return back()->with('success', 'Bank account details updated successfully');
    }
}
