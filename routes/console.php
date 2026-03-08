<?php

use Illuminate\Support\Facades\Schedule;
use App\Jobs\ProcessDailyBilling;

Schedule::command('phone:reset-limits')->dailyAt('00:00')->sendOutputTo(storage_path('logs/transactions/data/task.log'));
Schedule::command('app:refresh-tokens')->dailyAt('00:00')->sendOutputTo(storage_path('logs/transactions/data/task.log'));
Schedule::command('phone:reset-limits-monthly')->monthly()->sendOutputTo(storage_path('logs/transactions/data/task.log'));

// Process daily billing for postpaid users
Schedule::job(new ProcessDailyBilling())->dailyAt('00:00')->sendOutputTo(storage_path('logs/transactions/data/daily_billing.log'));

// Schedule::command('test:cron')->everyFiveMinutes()->sendOutputTo(storage_path('logs/test_shed.log'));

