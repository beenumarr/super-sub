<?php

namespace App\Notifications;

use App\Models\PhoneNumber;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InsufficientBalanceNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $phoneNumber;
    protected $transaction;
    protected $errorMessage;

    public function __construct(PhoneNumber $phoneNumber, Transaction $transaction, string $errorMessage)
    {
        $this->phoneNumber = $phoneNumber;
        $this->transaction = $transaction;
        $this->errorMessage = $errorMessage;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Insufficient Balance Alert – Phone Number ' . $this->phoneNumber->number)
            ->greeting("Hello {$notifiable->name},")
            ->line("We detected that your phone number **{$this->phoneNumber->number}** has insufficient balance for data transactions.")
            ->line("**Transaction Details:**")
            ->line("- Phone Number: {$this->phoneNumber->number}")
            ->line("- Network: " . ($this->phoneNumber->network->name ?? 'Unknown'))
            ->line("- Error: {$this->errorMessage}")
            ->line("**Action Required:**")
            ->line("Please recharge your phone number to continue using our services.")
            ->action('View Phone Numbers', url('/dashboard'))
            ->line('If you have any questions, please contact our support team.')
            ->line('Thanks for choosing us!');
    }
}
