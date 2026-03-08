<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Opcodes\LogViewer\Facades\LogViewer;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Notifications\Messages\MailMessage;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        // VerifyEmail::toMailUsing(function ($notifiable, $url) {
        //     return (new MailMessage)
        //         ->subject("Verify Your " .config('app.name'). " Email Address")
        //         ->markdown('emails.verify-email', ['url' => $url]);
        // });

        // ResetPassword::toMailUsing(function ($notifiable, $url) {
        //     return (new MailMessage)
        //         ->subject("Reset Your " .config('app.name'). " Account Password")
        //         ->markdown('emails.password-reset', ['url' => $url]);
        // });
    }
}

