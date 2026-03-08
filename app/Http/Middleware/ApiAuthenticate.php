<?php

namespace App\Http\Middleware;

use Closure;


class ApiAuthenticate
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
        public function handle($request, Closure $next)
        {
            $header = $request->header('Authorization');
            if ($header !== null) {

                $header = str_replace('Token', 'Bearer', $header);
                $request->headers->set('Authorization', $header);

            }
            return $next($request);
        }

}
