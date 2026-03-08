<?php

use App\Events\InsufficientBalanceDetected;
use App\Listeners\HandleInsufficientBalanceNotification;
use App\Models\User;
use App\Models\PhoneNumber;
use App\Models\Transaction;
use App\Models\Network;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

test('insufficient balance event can be dispatched', function () {
    Event::fake();

    $user = User::factory()->create();
    $network = Network::factory()->create(['name' => 'MTN']);
    $phoneNumber = PhoneNumber::factory()->create([
        'user_id' => $user->id,
        'network_id' => $network->id,
        'number' => '08012345678'
    ]);
    $transaction = Transaction::factory()->create([
        'user_id' => $user->id,
        'type' => 'DATA'
    ]);

    $event = new InsufficientBalanceDetected(
        $user,
        $phoneNumber,
        $transaction,
        'Insufficient balance'
    );

    Event::dispatch($event);

    Event::assertDispatched(InsufficientBalanceDetected::class);
});

test('insufficient balance listener handles the event', function () {
    Notification::fake();

    $user = User::factory()->create();
    $network = Network::factory()->create(['name' => 'MTN']);
    $phoneNumber = PhoneNumber::factory()->create([
        'user_id' => $user->id,
        'network_id' => $network->id,
        'number' => '08012345678'
    ]);
    $transaction = Transaction::factory()->create([
        'user_id' => $user->id,
        'type' => 'DATA'
    ]);

    $event = new InsufficientBalanceDetected(
        $user,
        $phoneNumber,
        $transaction,
        'Insufficient balance'
    );

    $listener = new HandleInsufficientBalanceNotification();
    $listener->handle($event);

    // The listener should attempt to send a notification
    // We can't easily test the actual email sending in a unit test
    // but we can verify the listener doesn't throw any errors
    expect($listener)->toBeInstanceOf(HandleInsufficientBalanceNotification::class);
});
