<?php

namespace App\Http\Middleware;

use Closure;
use Throwable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpFoundation\Response;

class HandleApiExceptions
{

    public function handle(Request $request, Closure $next)
        {
            try {
                return $next($request);
            } catch (QueryException $e) {
                // Duplicate entry
                if ($e->errorInfo[1] == 1062) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Duplicate record found.',
                    ], 409);
                }

                Log::error('Database error', ['error' => $e->getMessage()]);

                return response()->json([
                    'status' => false,
                    'message' => 'Database error occurred.',
                ], 500);
            } catch (Throwable $e) {
                Log::error('Unexpected error', ['error' => $e->getMessage()]);

                return response()->json([
                    'status' => false,
                    'message' => 'An unexpected error occurred. Please try again.',
                ], 500);
            }
        }


}
