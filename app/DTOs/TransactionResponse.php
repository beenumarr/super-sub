<?php

namespace App\DTOs;

use App\Models\Transaction;
use App\Models\PhoneNumber;

class TransactionResponse
{
    public function __construct(
        public Transaction $transaction,
        public ?PhoneNumber $phoneNumber,
    ) {}
}
