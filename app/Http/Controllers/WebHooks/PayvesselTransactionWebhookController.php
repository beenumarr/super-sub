<?php
namespace App\Http\Controllers\WebHooks;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Services\PaymentGateway\Payvessel\HandleTransactionCompletionWebhook;
use Symfony\Component\HttpFoundation\Response;


class PayvesselTransactionWebhookController extends Controller
{
    // validate ip and fix

    public function handleTransactionCompletion(Request $request)
    {
        $payload = json_decode($request->getContent(), true);

        $this->validateSignature($request);

        HandleTransactionCompletionWebhook::dispatch($payload);

        return new Response('Webhook Handled', 200);

    }




    public function validateSignature(Request $request)
    {
        $secret_key = config('settings.payvessel_secret_key'); // Replace with your client secret

        $payvessel_signature = $request->header('payvessel-http-signature');

        $requestBody = $request->getContent();
        $ip_address = $request->ip();

        $computedSignature = hash_hmac('sha512', $requestBody, cs_decrypt($secret_key));

        if (!hash_equals($computedSignature, $payvessel_signature) || !in_array($ip_address, ["162.246.254.36", "3.255.23.38"])) {
            // Signature is not valid, terminate the request
            Log::warning('Invalid webhook signature', ['data' => $computedSignature, 'other' => $payvessel_signature]);
            throw new \RuntimeException('Invalid webhook signature');
        }

        Log::info('Signature is valid');

    }




}
