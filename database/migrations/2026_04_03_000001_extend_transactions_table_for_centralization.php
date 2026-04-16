<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'reference_id')) {
                $table->string('reference_id')->nullable()->unique()->after('id');
            }

            if (!Schema::hasColumn('transactions', 'provider_name')) {
                $table->string('provider_name')->nullable()->index()->after('reference_id');
            }

            if (!Schema::hasColumn('transactions', 'provider_id')) {
                // String to support numeric IDs and provider codes.
                $table->string('provider_id')->nullable()->index()->after('provider_name');
            }

            if (!Schema::hasColumn('transactions', 'provider_reference')) {
                $table->string('provider_reference')->nullable()->index()->after('provider_id');
            }

            if (!Schema::hasColumn('transactions', 'type')) {
                $table->string('type')->nullable()->index()->after('provider_reference');
            }

            if (!Schema::hasColumn('transactions', 'metadata')) {
                $table->json('metadata')->nullable()->after('status');
            }

            if (!Schema::hasColumn('transactions', 'webhook_sent')) {
                $table->boolean('webhook_sent')->default(false)->after('metadata');
            }
            if (!Schema::hasColumn('transactions', 'webhook_response_body')) {
                $table->longText('webhook_response_body')->nullable()->after('webhook_sent');
            }
            if (!Schema::hasColumn('transactions', 'webhook_retry_count')) {
                $table->unsignedInteger('webhook_retry_count')->default(0)->after('webhook_response_body');
            }
            if (!Schema::hasColumn('transactions', 'webhook_sent_at')) {
                $table->dateTime('webhook_sent_at')->nullable()->after('webhook_retry_count');
            }
            if (!Schema::hasColumn('transactions', 'webhook_last_attempt_at')) {
                $table->dateTime('webhook_last_attempt_at')->nullable()->after('webhook_sent_at');
            }

            if (!Schema::hasColumn('transactions', 'api_process_started_at')) {
                $table->dateTime('api_process_started_at')->nullable()->after('webhook_last_attempt_at');
            }
            if (!Schema::hasColumn('transactions', 'api_response_received_at')) {
                $table->dateTime('api_response_received_at')->nullable()->after('api_process_started_at');
            }
            if (!Schema::hasColumn('transactions', 'api_process_duration')) {
                $table->unsignedInteger('api_process_duration')->nullable()->after('api_response_received_at');
            }
            if (!Schema::hasColumn('transactions', 'transaction_duration')) {
                $table->unsignedInteger('transaction_duration')->nullable()->after('api_process_duration');
            }

            if (!Schema::hasColumn('transactions', 'telco_price')) {
                $table->decimal('telco_price', 16, 2)->nullable()->after('transaction_duration');
            }
            if (!Schema::hasColumn('transactions', 'full_size')) {
                $table->unsignedInteger('full_size')->nullable()->after('telco_price');
            }
            if (!Schema::hasColumn('transactions', 'dispense_channel')) {
                $table->string('dispense_channel')->nullable()->after('full_size');
            }
            if (!Schema::hasColumn('transactions', 'product_category')) {
                $table->string('product_category')->nullable()->after('dispense_channel');
            }
            if (!Schema::hasColumn('transactions', 'product_id')) {
                $table->string('product_id')->nullable()->index()->after('product_category');
            }
            if (!Schema::hasColumn('transactions', 'service_fee')) {
                $table->decimal('service_fee', 16, 2)->nullable()->after('product_id');
            }
        });

        // Avoid doctrine/dbal dependency by issuing driver-specific statements.
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            // Normalize `status` to VARCHAR for uppercase values.
            DB::statement("ALTER TABLE `transactions` MODIFY `status` VARCHAR(32) NOT NULL");
            // Make `api_response` safely hold larger payloads.
            DB::statement("ALTER TABLE `transactions` MODIFY `api_response` LONGTEXT NULL");
        } elseif ($driver === 'sqlite') {
            // SQLite stores text dynamically; no-op.
        }
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $columns = [
                'reference_id',
                'provider_name',
                'provider_id',
                'provider_reference',
                'type',
                'metadata',
                'webhook_sent',
                'webhook_response_body',
                'webhook_retry_count',
                'webhook_sent_at',
                'webhook_last_attempt_at',
                'api_process_started_at',
                'api_response_received_at',
                'api_process_duration',
                'transaction_duration',
                'telco_price',
                'full_size',
                'dispense_channel',
                'product_category',
                'product_id',
                'service_fee',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('transactions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

