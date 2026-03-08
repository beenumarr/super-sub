# Daily Billing System (Postpaid Feature)

## Overview

The system now supports two billing types for users:
1. **Prepaid**: Service fees are deducted immediately from wallet balance. Transaction fails if insufficient balance.
2. **Postpaid**: Service fees accumulate throughout the day and are billed daily via a scheduler job.

## Database Schema

### Users Table (New Columns)

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `billing_type` | enum('prepaid', 'postpaid') | 'prepaid' | User's billing method |
| `credit_limit` | decimal(15,2) | 0 | Maximum credit available for postpaid users |
| `today_usage_fee` | decimal(15,2) | 0 | Accumulated service fees for current day |
| `outstanding_balance` | decimal(15,2) | 0 | Unpaid balance carried over from previous billings |
| `last_billing_date` | timestamp | null | Last date billing was processed |

### Phone Numbers Table (New Column)

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `balance_updated_at` | timestamp | null | Timestamp when phone number balance was last updated |

## How It Works

### Prepaid Users (Default)
- Service fees are deducted immediately from wallet balance
- Transaction fails with error code `0012` if insufficient balance
- Traditional pay-as-you-go model

### Postpaid Users
1. **During Transactions**:
   - Service fees accumulate in `today_usage_fee` field
   - No immediate wallet deduction
   - Available credit calculated as: `(Wallet Balance + Credit Limit) - (Today's Usage + Outstanding Balance)`
   - Transaction fails with error code `0014` if exceeds available credit

2. **Daily Billing Process** (Runs at 01:00 AM):
   - Finds all postpaid users with `today_usage_fee > 0`
   - Deducts accumulated fees from wallet balance
   - If wallet balance goes negative:
     - Sets wallet balance to 0
     - Moves negative amount to `outstanding_balance`
   - Resets `today_usage_fee` to 0
   - Updates `last_billing_date`

## Available Credit Calculation

For postpaid users:
```
Available Credit = (Wallet Balance + Credit Limit) - (Today's Usage + Outstanding Balance)
```

Example:
- Wallet Balance: $100
- Credit Limit: $500
- Today's Usage: $50
- Outstanding Balance: $20
- **Available Credit = ($100 + $500) - ($50 + $20) = $530**

## User Model Helper Methods

### `isPostpaid(): bool`
Check if user is on postpaid billing.

### `isPrepaid(): bool`
Check if user is on prepaid billing.

### `getAvailableCredit(): float`
Calculate available credit for postpaid users. Returns maximum credit available.

### `hasSufficientFunds(float $amount): bool`
Check if user has sufficient funds (prepaid checks wallet balance, postpaid checks available credit).

## Transaction Helper Updates

### `validateBalanceAndDeductAmount($user_id, $amount)`

**Prepaid Behavior**:
- Locks wallet and user records
- Validates wallet balance
- Deducts amount immediately
- Returns: `['before' => float, 'after' => float, 'billing_type' => 'prepaid']`
- Throws `ApiTransactionFailException` (0012) if insufficient balance

**Postpaid Behavior**:
- Locks wallet and user records
- Validates available credit
- Accumulates amount to `today_usage_fee`
- Wallet balance remains unchanged
- Returns: `['before' => float, 'after' => float, 'billing_type' => 'postpaid']`
- Throws `ApiTransactionFailException` (0014) if insufficient credit

## Daily Billing Job

**Job**: `App\Jobs\ProcessDailyBilling`
**Schedule**: Daily at 01:00 AM
**Log File**: `storage/logs/transactions/data/daily_billing.log`

### Process Flow:
1. Query postpaid users with `today_usage_fee > 0`
2. Lock wallet and process each user in transaction
3. Deduct `today_usage_fee` from wallet balance
4. Handle negative balances (move to `outstanding_balance`)
5. Reset `today_usage_fee` to 0
6. Update `last_billing_date`
7. Log results (success/failure counts, total billed)

### Logging:
- **Info**: Successful billing for each user
- **Warning**: Negative balance scenarios, missing wallets
- **Error**: Processing failures with full trace
- **Summary**: Total users processed, success/failure counts, total amount

## Migration Commands

```bash
# Run migrations
php artisan migrate

# Rollback if needed
php artisan migrate:rollback
```

## Switching User Billing Type

### Enable Postpaid for User:
```php
$user = User::find($userId);
$user->billing_type = 'postpaid';
$user->credit_limit = 5000.00; // Set appropriate credit limit
$user->save();
```

### Switch Back to Prepaid:
```php
$user = User::find($userId);
$user->billing_type = 'prepaid';
$user->save();
```

## Error Codes

| Code | Message | Meaning |
|------|---------|---------|
| 0012 | Insufficient wallet balance | Prepaid user has insufficient funds |
| 0013 | User not found | User ID is invalid |
| 0014 | Insufficient credit limit | Postpaid user exceeded available credit |

## Testing

### Test Postpaid Flow:
```php
// Setup
$user = User::factory()->create([
    'billing_type' => 'postpaid',
    'credit_limit' => 1000.00,
]);
$user->wallet()->create(['balance' => 100.00]);

// Make transaction (fee should accumulate, not deduct)
$helper = new TransactionHelper();
$result = $helper->validateBalanceAndDeductAmount($user->id, 50.00);

// Verify
assert($user->fresh()->today_usage_fee == 50.00);
assert($user->wallet->balance == 100.00); // Unchanged

// Run billing job
ProcessDailyBilling::dispatch();

// Verify billing
assert($user->fresh()->today_usage_fee == 0.00);
assert($user->wallet->balance == 50.00); // Deducted
```

### Test Negative Balance:
```php
$user->wallet->update(['balance' => 30.00]);
$user->update(['today_usage_fee' => 50.00]);

ProcessDailyBilling::dispatch();

assert($user->fresh()->wallet->balance == 0.00);
assert($user->fresh()->outstanding_balance == 20.00);
```

## Scheduler Setup

Ensure the Laravel scheduler is running:

```bash
# Add to crontab
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Or use Laravel Horizon/Supervisor for queue workers.

## Monitoring

Monitor the daily billing job:

```bash
# View logs
tail -f storage/logs/transactions/data/daily_billing.log

# Check for users with outstanding balance
php artisan tinker
> User::where('outstanding_balance', '>', 0)->get()

# Check today's accumulated fees
> User::where('today_usage_fee', '>', 0)->get()
```

## API Integration Recommendations

When building API endpoints for this feature:

1. **Get User Billing Info**:
```php
return [
    'billing_type' => $user->billing_type,
    'wallet_balance' => $user->wallet->balance,
    'credit_limit' => $user->credit_limit,
    'today_usage_fee' => $user->today_usage_fee,
    'outstanding_balance' => $user->outstanding_balance,
    'available_credit' => $user->getAvailableCredit(),
    'last_billing_date' => $user->last_billing_date,
];
```

2. **Toggle Billing Type**:
```php
$user->update([
    'billing_type' => $request->billing_type,
    'credit_limit' => $request->credit_limit ?? 0,
]);
```

3. **Get Billing History**: Store billing records in a separate `billing_history` table for audit trail.

## Security Considerations

1. **Credit Limit Management**: Only admins should be able to modify credit limits
2. **Billing Type Changes**: Implement approval workflow for switching to postpaid
3. **Outstanding Balance**: Set policies for users with high outstanding balances
4. **Audit Trail**: Log all billing type changes and credit limit adjustments

## Performance Notes

- Uses database row locking (`lockForUpdate`) to prevent race conditions
- Daily job processes only users with usage fees (no unnecessary processing)
- Batch operations wrapped in transactions for data integrity
- Comprehensive logging for debugging and monitoring

## Future Enhancements

1. **Billing History Table**: Store detailed billing records
2. **Payment Plans**: Allow users to pay outstanding balance in installments
3. **Auto-disable**: Suspend users exceeding credit limits
4. **Email Notifications**: Send daily billing summaries
5. **Credit Limit Adjustments**: Auto-adjust based on payment history
6. **Multi-tier Credit Limits**: Different limits based on user categories
7. **Grace Periods**: Allow X days before suspending service for outstanding balance

