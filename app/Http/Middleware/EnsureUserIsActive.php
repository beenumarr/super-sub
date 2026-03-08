<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && !Auth::user()->active) {
            // Allow access to the deactivated page and logout without redirect loop
            if ($request->routeIs('account.deactivated') || $request->routeIs('logout')) {
                return $next($request);
            }

            return redirect()->route('account.deactivated');
        }

        return $next($request);
    }
}


