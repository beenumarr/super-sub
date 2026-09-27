<?php

namespace App\Http\Middleware;

use App\Http\Resources\AuthUserResource;
use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class KycRedirect
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        $isKycEnabled = in_array(config('settings.feat_enable_kyc'), ['1', 1, 'true', true], true)
            || (
                (in_array(config('settings.feat_enable_kyc_bvn'), ['1', 1, 'true', true], true) || in_array(config('settings.feat_enable_kyc_nin'), ['1', 1, 'true', true], true))
                && !in_array(config('settings.feat_enable_kyc'), ['0', 0, 'false', false], true)
            );

        if (!$isKycEnabled) {
            return $next($request);
        }

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user  = $request->user();

                if(!$user->kyc_verified_at){

                    return redirect(route('kyc'));

                }
            }
        }

        return $next($request);
    }
}
