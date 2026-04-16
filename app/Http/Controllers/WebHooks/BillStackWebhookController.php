<?php

namespace App\Http\Controllers\WebHooks;
use App\Http\Controllers\Controller;
use App\Models\FundingAccount;
use App\Models\User;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillStackWebhookController extends Controller
{
    private function isTrustedIP(Request $request): bool
    {
        $trustedIps = ['69.164.205.205', '102.215.57.210']; // Replace with BillStack's IPs
        return in_array($request->ip(), $trustedIps);
    }

    public function handlePaymentWebhook(Request $request)
    {
        if (!$this->isTrustedIP($request)) {
            Log::warning('Webhook received from untrusted IP: ' . $request->ip());
            return response()->json(['error' => 'Unauthorized'], 403);
        } else {
            try {
                // Log the incoming webhook for debugging
                Log::info('Received Webhook:', $request->all());
                // Validate the webhook event type
                if ($request->event != 'PAYMENT_NOTIFICATION') {
                    Log::info('Invalid event type');
                    return response()->json([
                        'message' => 'Invalid event type',
                        'event' => $request->event,
                ], 400);
                }
                $data = $request->data;
                Log::info($data);
                // Check if the transaction already exists (to avoid duplicates)
                if (Transaction::where('reference_id', $data['transaction_ref'])->exists()) {
                    Log::info('Transaction already processed');
                    return response()->json(['message' => 'Transaction already processed'], 200);
                }
                // $user = auth()->user()->fundingAccounts()->where('account_number', $data['account']['account_number'])->first();
                $fundAccount = FundingAccount::where('account_number', $data['account']['account_number'])->first();

                $user = User::find($fundAccount->user_id);
                $wallet = $user->wallet;
                $balance_before = $wallet->balance;
                // $charges = $this->applyMonnifyCharges($data['amount'], config('settings.monnify_funding_charges'));
                // $amount = floatval($data['amount']) - $charges;
                //UPDATE WALLET
                $amountPaid = $data['amount'];

                $charges = $this->applyBillStackCharges($amountPaid, config('settings.BillStack_funding_charges'));

                $amount = floatval($amountPaid) - $charges;
                //UPDATE WALLET
                $wallet->increment('balance', $amount);
                // $wallet->increment('balance', $data['amount']);
                $balance_after = $wallet->balance;

                Transaction::create([
                    'reference_id' => $data['transaction_ref'],
                    'user_id' => $user->id,
                    'type' => 'WALLET',
                    'amount' => $amount,
                    'status' => 'SUCCESS',
                    'description' => 'Account has been successfully funded',
                    'provider_name' => 'BillStack',
                    'provider_reference' => $data['transaction_ref'],
                    'api_response' => 'BILL STACK PAYMENT NOTIFICATION',
                    'balance_before' => $balance_before,
                    'balance_after' => $balance_after,
                    'metadata' => [
                        'ledger_type' => 'credit',
                        'method' => 'ACCOUNT_TRANSFER',
                        'payment_gateway' => $data['account']['bank_name'] ?? null,
                        'raw' => $data,
                    ],
                ]);

                return response()->json(['message' => 'Webhook processed successfully'], 200);
            } catch (\Exception $e) {
                Log::error('Webhook Error:', ['message' => $e->getMessage()]);
                return response()->json(['error' => 'Internal Server Error'], 500);
            }
        }
    }


    public function applyBillStackCharges($amount, $charges)
    {
        $charge = explode(' ', $charges);

        $totalCharge = 0;

        $chargeType = $charge[1];
        $chargeAmount = floatval($charge[0]);

        if ($chargeType === '%') {
            $totalCharge = round((floatval($amount) * $chargeAmount) / 100);
        } elseif ($chargeType === 'N') {
            $totalCharge = $chargeAmount;
        }

        return $totalCharge;
    }
}
