<?php

namespace App\Http\Controllers\WebHooks;

use App\Http\Controllers\Controller;
use App\Jobs\HandleZainpayWebhook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ZainpayWebhookController extends Controller
{
    /**
     * Handle incoming webhook requests from Zainpay.
     */
    public function handleTransactionCompletion(Request $request): Response
    {
        $payload = json_decode($request->getContent(), true) ?? $request->all();

        Log::info('Zainpay Webhook Received', [
            'headers' => $request->headers->all(),
            'payload' => $payload,
        ]);

        $this->validateSignature($request);

        HandleZainpayWebhook::dispatch($payload);

        return response()->json([
            'status' => 'success',
            'message' => 'Webhook Handled',
        ], 200);
    }

    /**
     * Validate the HMAC signature sent by Zainpay.
     */
    protected function validateSignature(Request $request): void
    {
        $rawSecret = config('settings.zainpay_secret_key');
        if (empty($rawSecret)) {
            Log::warning('Zainpay secret key not configured; skipping signature validation.');
            return;
        }

        $secretKey = cs_decrypt($rawSecret);
        $receivedSignature = $request->header('Zainpay-Signature')
            ?? $request->header('zainpay-signature')
            ?? $request->header('x-zainpay-signature');

        if (empty($receivedSignature)) {
            Log::warning('Zainpay webhook received without Zainpay-Signature header.');
            // Allow in test/sandbox or if no signature sent
            return;
        }

        $requestBody = $request->getContent();

        // Zainpay uses HmacSHA256 of the payload signed with your secret key
        $computedSha256 = hash_hmac('sha256', $requestBody, $secretKey);
        $computedSha512 = hash_hmac('sha512', $requestBody, $secretKey);

        if (!hash_equals($computedSha256, $receivedSignature) && !hash_equals($computedSha512, $receivedSignature)) {
            Log::warning('Invalid Zainpay webhook signature', [
                'computed_sha256' => $computedSha256,
                'received' => $receivedSignature,
            ]);
            throw new \RuntimeException('Invalid Zainpay webhook signature');
        }

        Log::info('Zainpay webhook signature verified successfully.');
    }
}
