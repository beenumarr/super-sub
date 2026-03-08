<?php
namespace App\Http\Controllers\WebHooks;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Jobs\HandlePaymentpointTransactionWebhook;
use Symfony\Component\HttpFoundation\Response;


class PaymentpointWebhookController extends Controller
{

    public function handleTransactionCompletion(Request $request)
    {
        $payload = json_decode($request->getContent(), true);

        $this->validateSignature($request);

        HandlePaymentpointTransactionWebhook::dispatch($payload);

        return new Response('Webhook Handled', 200);

    }




    private function validateSignature(Request $request)
    {

        $requestBody = $request->getContent();
        $ip_address = $request->ip();
        $secretKey = config('settings.paymentPoint_secret_key');
        $signatureHeader = $request->header('Paymentpoint-Signature');

        // info('Signature', ['data'=> $signatureHeader, 'ok'=> $_SERVER['HTTP_PAYMENTPOINT_SIGNATURE']]);

        $computedSignature = hash_hmac('sha256', $requestBody, cs_decrypt($secretKey));

        if (!hash_equals($computedSignature, $signatureHeader) || !in_array($ip_address, ["162.246.253.48"])) {
            Log::warning('Invalid webhook signature', ['data' => $computedSignature, 'other' => $signatureHeader]);
            throw new \RuntimeException('Invalid webhook signature');
        }

    }




}
