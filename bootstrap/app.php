<?php

use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use App\Http\Middleware\ApiAuthenticate;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\Admin as AdminMiddleware;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\EnsureUserIsActive;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: [
            '/webhooks/paystack',
            '/monnify/transaction-completion',
            '/payvessel/transaction-completion',
            '/paymentpoint/transaction-completion',
            '/billStack/transaction-completion'
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            EnsureUserIsActive::class,
        ]);

        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role' => RoleMiddleware::class,
            'feature' => \App\Http\Middleware\FeatureChecker::class,
            'kyc' => \App\Http\Middleware\KycRedirect::class,
            'kycCheck' => \App\Http\Middleware\KycCheck::class,
        ]);

        $middleware->priority([
            ApiAuthenticate::class,
            'auth:sanctum'
        ]);

        $middleware->alias([
            'feature' => \App\Http\Middleware\FeatureChecker::class,
            'kyc' => \App\Http\Middleware\KycRedirect::class,
            'kycCheck' => \App\Http\Middleware\KycCheck::class,
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions) {

    })->create();


            // $exceptions->render(function (Throwable $e, Request $request) {
        //     $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;

        //     return response()->view('errors.error', [
        //         'status' => $status,
        //         'message' => $e->getMessage(),
        //     ], $status);
        // });
