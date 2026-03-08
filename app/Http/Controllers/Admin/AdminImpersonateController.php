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
        session(['impersonate_original_id' => Auth::id(), 'debug'=> true]);

        Auth::login($user);

        return redirect('/dashboard'); // or wherever users land
    }

}
