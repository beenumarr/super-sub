<?php

namespace App\Gateways\Contracts;

use App\Models\Gateway;
use App\Models\Transaction;

interface DataGatewayInterface
{
    /**
     * Execute a data purchase against a third-party API.
     *
     * Implementations should:
     * - call the provider API using the gateway configuration
     * - update the Transaction status and metadata appropriately
     * - throw exceptions on unrecoverable errors
     */
    public function purchase(Transaction $transaction, array $payload, Gateway $gateway): void;
}

