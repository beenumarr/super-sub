<?php

namespace App\Http\Controllers;

use App\Models\AccountDeletionRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AccountDeletionController extends Controller
{
    /**
     * Show the public account deletion request page.
     * Compliant with Google Play Store Account Deletion Policy.
     */
    public function index()
    {
        $siteName = \App\Models\AppConfiguration::where('key', 'site_name')->first()?->value
            ?? config('settings.site_name', config('app.name', 'SuperSub'));

        return view('account_deletion', compact('siteName'));
    }

    /**
     * Process an account deletion request.
     */
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'confirm_deletion' => ['required', 'accepted'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        // If password is supplied and valid, perform direct deletion or queue it
        $isDirectDelete = false;
        if ($user && !empty($validated['password'])) {
            if (Hash::check($validated['password'], $user->password)) {
                $isDirectDelete = true;
                try {
                    DB::transaction(function () use ($user) {
                        $user->tokens()->delete();
                        $user->delete();
                    });
                } catch (\Throwable $e) {
                    Log::error('Direct account deletion error: ' . $e->getMessage());
                    $isDirectDelete = false;
                }
            } else {
                return back()->withErrors([
                    'password' => 'The provided password does not match our records for this account.',
                ])->withInput();
            }
        }

        try {
            AccountDeletionRequest::create([
                'user_id' => $user?->id,
                'email' => $validated['email'],
                'phone_number' => $validated['phone_number'] ?? $user?->phone_number,
                'reason' => $validated['reason'],
                'status' => $isDirectDelete ? 'processed' : 'pending',
                'ip_address' => $request->ip(),
                'processed_at' => $isDirectDelete ? now() : null,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Could not write account_deletion_request row: ' . $e->getMessage());
        }

        $message = $isDirectDelete
            ? 'Your account and personal data have been permanently deleted.'
            : 'Your account deletion request has been submitted successfully. Our team will verify and process your request within 7 business days.';

        return back()->with('status_message', $message)->with('status_type', 'success');
    }
}
