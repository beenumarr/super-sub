<?php

namespace App\Actions\APIs\Boltnet;

use App\Actions\Utils\ReverseTransaction;
use App\Models\DataTransaction;
use App\Models\Transaction;
use App\Models\TransactionApi;
use App\Utils\Transaction\TransactionHelper;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Log;

class Data
{
    public function handle(Transaction $transaction, DataTransaction $dataTransaction, ?TransactionApi $api = null)
    {
        $reverseTransaction = new ReverseTransaction();
        $client = new Client();
        $helpers = new TransactionHelper();

        $apiUrl = 'https://boltnet.com.ng';
        $apiToken = '';

        if (config('app.enable_standalone_api') && $api) {
            $apiUrl = $api->url ?: 'https://boltnet.com.ng';
            $apiToken = $api->token;
            $networkId = $helpers->getNetworkId($api, $dataTransaction->network) ?: $dataTransaction->network->api_network_id;

            $planApi = $dataTransaction->plan->apis->where('transaction_api_id', $api->id)->first();
            $planId = ($planApi && !empty($planApi->product_code)) ? $planApi->product_code : $dataTransaction->plan->api_plan_id;
        } else {
            $apiUrl = config('settings.transaction_api_url') ?: 'https://boltnet.com.ng';
            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $networkId = $dataTransaction->network->api_network_id;
            $planId = $dataTransaction->plan->api_plan_id;
        }

        $payload = [
            'network' => is_numeric($networkId) ? (int) $networkId : $networkId,
            'mobile_number' => (string) $dataTransaction->phone_number,
            'plan' => is_numeric($planId) ? (int) $planId : $planId,
            'Ported_number' => true,
            'request_id' => (string) $transaction->reference,
        ];

        $endpoint = rtrim($apiUrl, '/') . '/api/data/';

        try {
            $response = $client->post($endpoint, [
                'headers' => [
                    'Authorization' => "Bearer {$apiToken}",
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
                'timeout' => 45,
            ]);

            $res = json_decode($response->getBody()->getContents(), true);
            Log::info('Boltnet Data Response:', ['payload' => $payload, 'response' => $res]);

            $status = strtolower($res['Status'] ?? $res['status'] ?? '');

            if ($status === 'successful' || $status === 'success') {
                $transaction->update([
                    'status' => 'SUCCESS',
                    'vending_medium' => $api ? $api->name : 'Boltnet',
                    'api_response' => $res['api_response'] ?? $res['description'] ?? 'Transaction successful',
                ]);
            } else {
                $errorMessage = $res['api_response'] ?? $res['description'] ?? $res['message'] ?? 'Transaction Failed';
                $reverseTransaction->handle($transaction, 'Boltnet: ' . $errorMessage);
            }
        } catch (ClientException $e) {
            $responseBody = $e->getResponse() ? (string) $e->getResponse()->getBody() : '';
            Log::error('Boltnet Data ClientException: ' . $e->getMessage(), ['body' => $responseBody]);

            $errorData = json_decode($responseBody, true);
            $msg = '';
            if (is_array($errorData)) {
                if (!empty($errorData['msg'])) {
                    $msg = $errorData['msg'];
                } elseif (!empty($errorData['message'])) {
                    $msg = $errorData['message'];
                } elseif (!empty($errorData['api_response'])) {
                    $msg = $errorData['api_response'];
                } elseif (!empty($errorData['error'])) {
                    $msg = is_array($errorData['error']) ? implode(', ', $errorData['error']) : $errorData['error'];
                } elseif (!empty($errorData['detail'])) {
                    $msg = $errorData['detail'];
                } else {
                    $msg = $responseBody;
                }
            } else {
                $msg = $responseBody ?: $e->getMessage();
            }

            $reverseTransaction->handle($transaction, 'Boltnet: ' . $msg);
        } catch (\Exception $e) {
            Log::error('Boltnet Data Exception: ' . $e->getMessage());
            $reverseTransaction->handle($transaction, 'Boltnet: ' . $e->getMessage());
        }

        return $transaction->status;
    }
}
