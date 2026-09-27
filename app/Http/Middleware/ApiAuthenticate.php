<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

class ApiAuthenticate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization');
        $apiKey = $request->header('api-key') ?? $request->header('x-api-key');

        $token = null;

        if ($header !== null) {
            if (preg_match('/^(?:Bearer|Token)\s+(.*)$/i', trim($header), $matches)) {
                $token = trim($matches[1]);
            } else {
                $token = trim($header);
            }
            $request->headers->set('Authorization', 'Bearer ' . $token);
        } elseif ($apiKey !== null) {
            $token = trim($apiKey);
            $request->headers->set('Authorization', 'Bearer ' . $token);
        }

        if ($token) {
            // 1. Try resolving through Sanctum PersonalAccessToken first
            $sanctumToken = PersonalAccessToken::findToken($token);
            if ($sanctumToken && $sanctumToken->tokenable instanceof User) {
                Auth::guard('sanctum')->setUser($sanctumToken->tokenable);
                $request->setUserResolver(fn () => $sanctumToken->tokenable);
            } else {
                // 2. Try resolving through original_token, api_token, or api_key on the User model
                $hashed = hash('sha256', $token);
                $user = User::where('original_token', $token)
                    ->orWhere('api_token', $token)
                    ->orWhere('api_token', $hashed)
                    ->orWhere('api_key', $token)
                    ->orWhere('api_key', $hashed)
                    ->first();

                if ($user) {
                    Auth::guard('sanctum')->setUser($user);
                    $request->setUserResolver(fn () => $user);
                }
            }
        }

        return $next($request);
    }
}
