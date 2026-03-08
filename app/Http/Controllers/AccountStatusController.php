<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountStatusController extends Controller
{
    public function deactivated(Request $request): Response
    {
        $ip = $request->ip();
        $userAgent = $request->userAgent();

        // Try resolve location if available via request headers (behind proxies/CDN)
        $location = [
            'country' => $request->headers->get('CF-IPCountry') ?? null,
            'city' => null,
        ];

        return Inertia::render('auth/Deactivated', [
            'meta' => [
                'ip' => $ip,
                'user_agent' => $userAgent,
                'location' => $location,
                'session_id' => $request->session()->getId(),
            ],
        ]);
    }
}


