<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Jobs\ProcessPaystackSuccessWebhook;
use Symfony\Component\HttpFoundation\Response;

class WebhookController extends Controller
{
    public function handlePaystack(Request $request)
    {
        // Verify Paystack Signature
        $signature = $request->header('x-paystack-signature');
        $secret = config('services.paystack.secret');

        if (!$signature || !hash_equals($signature, hash_hmac('sha512', $request->getContent(), $secret))) {
            Log::warning('Invalid Paystack webhook signature.', ['ip' => $request->ip()]);
            return response()->json(['status' => 'Invalid signature'], Response::HTTP_UNAUTHORIZED);
        }

        $payload = $request->all();

        // Log for debugging
        Log::info('Paystack webhook received:', $payload);

        // Handle event types
        switch ($payload['event']) {
            case 'charge.success':
                $this->handleChargeSuccess($payload['data']);
                break;

            case 'transfer.success':
                $this->handleTransferSuccess($payload['data']);
                break;

            case 'transfer.failed':
                $this->handleTransferFailed($payload['data']);
                break;

            default:
                Log::info('Unhandled Paystack event: ' . $payload['event']);
        }

        return response()->json(['status' => 'success']);
    }

    protected function handleChargeSuccess(array $data)
    {
        $reference = $data['reference'] ?? null;

        Log::info('Charge success for reference: ' . $reference);

        if (!$reference) {
            Log::warning('Paystack webhook missing reference.');
            return;
        }

        // Dispatch the job to handle full logic (create transaction, fund wallet, etc.)
        ProcessPaystackSuccessWebhook::dispatch([
            'event' => 'charge.success',
            'data' => $data
        ]);
    }


    protected function handleTransferSuccess(array $data)
    {
        // Example: update transfer status in your system
        Log::info('Transfer success:', $data);
    }

    protected function handleTransferFailed(array $data)
    {
        // Example: retry or notify admin
        Log::error('Transfer failed:', $data);
    }
}

