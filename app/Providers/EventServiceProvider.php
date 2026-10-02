<?php

namespace App\Providers;

use App\Events\TransactionSucceeded;
use App\Events\TransactionFailed;
use App\Listeners\HandleTransactionSuccess;
use App\Listeners\HandleTransactionFail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        // TransactionSucceeded::class => [
        //     HandleTransactionSuccess::class,
        // ],
        // TransactionFailed::class => [
        //     HandleTransactionFail::class,
        // ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        \App\Models\Transaction::observe(\App\Observers\TransactionObserver::class);
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
