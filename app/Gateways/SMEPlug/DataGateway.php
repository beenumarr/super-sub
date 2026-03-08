<?php

namespace App\Gateways\SMEPlug;

use GuzzleHttp\Client;
use App\Models\Gateway;
use App\Models\Transaction;
use App\Gateways\Contracts\DataGatewayInterface;
use Illuminate\Support\Facades\Log;
use App\Utils\DataTransaction\DataTransactionUtil;

class DataGateway implements DataGatewayInterface
{
    public function purchase(Transaction $transaction, array $payload, Gateway $gateway): void
    {
        $client = new Client();
        $apiUrl = rtrim($gateway->url, '/');
        $apiToken = $gateway->token ?? '';

        $data = [
            'network_id' => (string) ($payload['network_id'] ?? ''),
            'plan_id' => (string) ($payload['product_code'] ?? ''),
            'phone' => (string) ($payload['beneficiary'] ?? ''),
            'customer_reference' => $this->customerReference($transaction->reference_id),
        ];

        try {
            $response = $client->post("{$apiUrl}/v1/data/purchase", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiToken,
                    'Accept' => 'application/json',
                    'X-Requested-With' => 'XMLHttpRequest',
                ],
                'json' => $data,
                'withCredentials' => true,
            ]);

            $res = json_decode($response->getBody(), true);
            Log::info('SMEPlug data purchase response', ['response' => $res]);

            if (!empty($res['status']) && ($res['data']['current_status'] ?? '') === 'success') {
                $transaction->update([
                    'status' => 'SUCCESS',
                    'provider_name' => $gateway->name,
                    'provider_id' => $gateway->id,
                    'api_response' => $res['data']['msg'] ?? 'Transaction successful',
                ]);
                return;
            }

            $apiResponse = $res['msg'] ?? 'Something went wrong.';
            $this->markFailedAndRefund($transaction, 'api: ' . $apiResponse);
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $body = $e->getResponse() ? (string) $e->getResponse()->getBody() : '';
            $decoded = $body ? json_decode($body, true) : null;
            $message = $decoded['message'] ?? $e->getMessage();
            Log::error('SMEPlug ClientException', ['message' => $message]);
            $this->markFailedAndRefund($transaction, $message);
        } catch (\GuzzleHttp\Exception\ServerException $e) {
            $res = $e->getResponse();
            $body = $res ? (string) $res->getBody() : '';
            $decoded = $body ? json_decode($body, true) : null;
            $message = $decoded['message'] ?? $e->getMessage();
            $statusCode = $res ? $res->getStatusCode() : null;

            if ($statusCode === 504) {
                $transaction->update([
                    'status' => 'PENDING',
                    'api_response' => 'Your transaction is being processed. Thank you for your patience.',
                ]);
                Log::warning('SMEPlug 504 Gateway Timeout – transaction left PENDING', ['message' => $message]);
                return;
            }

            Log::error('SMEPlug ServerException', ['message' => $message]);
            $this->markFailedAndRefund($transaction, $message);
        } catch (\Throwable $e) {
            Log::error('SMEPlug exception', ['message' => $e->getMessage()]);
            $this->markFailedAndRefund($transaction, 'Exception: ' . $e->getMessage());
        }
    }

    protected function customerReference(string $referenceId): string
    {
        return now()->year . $referenceId;
    }

    protected function markFailedAndRefund(Transaction $transaction, string $apiResponse): void
    {
        $transaction->update([
            'status' => 'FAILED',
            'api_response' => $apiResponse,
        ]);
        DataTransactionUtil::refundTransaction($transaction->user_id, (float) $transaction->amount);
    }
}
