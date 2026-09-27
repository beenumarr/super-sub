<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified as BaseEnsureEmailIsVerified;

class EnsureEmailIsVerified extends BaseEnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $redirectToRoute
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse|null
     */
    public function handle($request, Closure $next, $redirectToRoute = null)
    {
        $isEmailVerificationEnabled = in_array(config('settings.feat_enable_email_verification'), ['1', 1, 'true', true], true);

        if (!$isEmailVerificationEnabled) {
            return $next($request);
        }

        return parent::handle($request, $next, $redirectToRoute);
    }
}
