<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PinController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/pin', [
            'hasPin' => $request->user()->hasTransactionPin(),
        ]);
    }

    public function update(Request $request): RedirectResponse
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
                    'current_pin' => 'The current PIN is incorrect.',
                ]);
            }
        }

        $user->update(['transaction_pin' => $validated['pin']]);

        return back()->with('status', 'pin-updated');
    }
}
