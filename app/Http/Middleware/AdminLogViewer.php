<?php

namespace App\Http\Middleware;



class AdminLogViewer
{
    public function handle($request, $next)
    {
        return $request->user()
        && $request->user()->role === 'admin' ? $next($request) : abort(403);
    }
}
