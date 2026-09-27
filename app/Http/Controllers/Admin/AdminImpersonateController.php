<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class AdminImpersonateController extends Controller
{
    public function impersonate(User $user)
    {
        $originalId = session('impersonate_original_id') ?? Auth::id();

        Auth::login($user);

        session([
            'impersonate_original_id' => $originalId,
            'debug' => true
        ]);

        return redirect('/dashboard')->with('success', "Logged in as {$user->name}");
    }

    public function leave()
    {
        $adminId = session('impersonate_original_id');

        if ($adminId) {
            $admin = User::find($adminId);
            if ($admin) {
                Auth::login($admin);
                session()->forget(['impersonate_original_id', 'debug']);

                return redirect()->route('admin.users.index')->with('success', 'Returned to admin session.');
            }
        }

        return redirect('/dashboard');
    }
}
