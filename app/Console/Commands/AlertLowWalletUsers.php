<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use App\Notifications\LowWalletBalance;

class AlertLowWalletUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:alert-low-wallet-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $threshold = config('constants.min_wallet_balance');

        $users = User::whereHas('wallet', function($q) use($threshold){
            $q->where('balance', '<', $threshold);
        })->get();

        foreach ($users as $user) {
            $user->notify(new LowWalletBalance($user->wallet->balance));
        }

        $this->info('Low balance alerts sent.');
    }

}
