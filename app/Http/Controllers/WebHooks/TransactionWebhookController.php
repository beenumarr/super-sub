<?php
namespace App\Http\Controllers\WebHooks;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Jobs\HandleTransactionCompletionWebhook;
use Symfony\Component\HttpFoundation\Response;


class TransactionWebhookController extends Controller
{

    public function handleTransactionCompletion(Request $request)
    {
        $payload = json_decode($request->getContent(), true);

        $this->validateSignature($request);

        HandleTransactionCompletionWebhook::dispatch($payload['eventData']);

        return new Response('Webhook Handled', 200);

    }




    public function validateSignature(Request $request)
    {
        $clientSecret = config('settings.monnify_secret_key'); // Replace with your client secret
        $receivedSignature = $request->header('monnify-signature');
        $requestBody = $request->getContent();

        $receivedIP = $request->ip();

        // if ($receivedIP !== '35.242.133.146') {
        //     Log::warning('Invalid Monnify webhook IP', ['received_ip' => $receivedIP]);
        //     throw new \RuntimeException('Invalid Monnify webhook IP');
        // }

        $computedSignature = hash_hmac('sha512', $requestBody, cs_decrypt($clientSecret));

        if (!hash_equals($computedSignature, $receivedSignature)) {
            Log::warning('Invalid Monnify webhook signature', ['data' => $computedSignature, 'other' => $receivedSignature]);
            throw new \RuntimeException('Invalid Monnify webhook signature');
        }
    }




}
