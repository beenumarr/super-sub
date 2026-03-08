<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowWalletBalance extends Notification
{
    protected $balance;

    public function __construct($balance)
    {
        $this->balance = $balance;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Low Wallet Balance – Please Top Up')
            ->greeting("Hello {$notifiable->name},")
            ->line("We noticed your wallet balance is low.")
            ->line("**Current Balance:** ₦{$notifiable->wallet->balance}")
            ->line("To avoid service disruption, please top up your wallet.")
            ->action('Top Up Now', url('/wallet'))
            ->line('Thanks for choosing us!');
    }
}

