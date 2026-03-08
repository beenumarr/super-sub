<?php

namespace App\Actions\APIs\Kirani;

use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\DataTransaction;
use App\Models\AppConfiguration;
use Illuminate\Support\Facades\Log;
use App\Actions\Utils\ReverseTransaction;

class PurchaseMinutes
{
    /**
     * Process a Kirani minutes purchase transaction.
     */
    public function handle(Transaction $transaction, DataTransaction $dataTransaction): string
    {
        $reverseTransaction = new ReverseTransaction();

        $tokenResult = (new GetToken())->handle();

        if (($tokenResult['status'] ?? null) !== 'success' || empty($tokenResult['token'])) {
            $reverseTransaction->handle($transaction, [
                'api_response' => $tokenResult['message'] ?? 'Unable to obtain Kirani token',
            ]);
            return 'failed';
        }

        $idToken = $tokenResult['token'];
        $client = new Client([
            'timeout' => 180,
            'connect_timeout' => 10,
        ]);

        $phoneNumber = $dataTransaction->phone_number;
        $plan = $dataTransaction->plan;
        $minutes = (int) $plan->size; // Size represents minutes for Kirani

        try {
            $response = $client->post($this->getPurchaseUrl(), [
                'headers' => [
                    'Authorization' => "Bearer {$idToken}",
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'did' => $phoneNumber,
                    'minutes' => $minutes,
                ],
            ]);

            $res = json_decode((string) $response->getBody(), true);
            $statusCode = $response->getStatusCode();

            Log::info('Kirani Purchase Response: ', [
                'response' => $res,
                'status_code' => $statusCode,
            ]);

            // Check for successful response
            // Kirani API returns message like "Credit distributed successfully"
            $message = $res['message'] ?? '';
            $isSuccess = $statusCode === 200 && (
                stripos($message, 'success') !== false ||
                stripos($message, 'distributed') !== false ||
                ($res['status'] ?? '') === 'success'
            );

            if ($isSuccess) {
                $transaction->update([
                    'status' => 'success',
                    'vending_medium' => 'Kirani API',
                    'api_response' => $message ?: 'Transaction successful',
                    'api_reference' => $res['reference'] ?? null,
                ]);

                return 'success';
            }

            // Handle failed response
            $errorMessage = $message ?: $res['error'] ?? 'Transaction failed';
            $reverseTransaction->handle($transaction, [
                'api_response' => $errorMessage,
            ]);

            return 'failed';

        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $response = $e->getResponse();
            $body = $response ? (string) $response->getBody() : null;
            $decoded = $body ? json_decode($body, true) : null;

            $message = $decoded['message'] ?? $decoded['error'] ?? $e->getMessage();

            Log::error('Kirani Purchase ClientException: ' . $message);

            $reverseTransaction->handle($transaction, [
                'api_response' => $this->normalizeError($message),
            ]);

            return 'failed';

        } catch (\GuzzleHttp\Exception\ServerException $e) {
            $response = $e->getResponse();
            $statusCode = $response ? $response->getStatusCode() : null;
            $body = $response ? (string) $response->getBody() : null;
            $decoded = $body ? json_decode($body, true) : null;

            $message = $decoded['message'] ?? $e->getMessage();

            Log::error('Kirani Purchase ServerException: ' . $message);

            // Handle 504 Gateway Timeout - set as pending
            if ($statusCode == 504) {
                $transaction->update([
                    'status' => 'pending',
                    'api_response' => 'Your transaction is being processed. Thank you for your patience.',
                ]);

                return 'pending';
            }

            $reverseTransaction->handle($transaction, [
                'api_response' => $this->normalizeError($message),
            ]);

            return 'failed';

        } catch (\Exception $e) {
            Log::error('Kirani Purchase Exception: ' . $e->getMessage());

            $reverseTransaction->handle($transaction, [
                'api_response' => 'An unexpected error occurred. Please try again.',
            ]);

            return 'failed';
        }
    }

    /**
     * Get the Kirani purchase API URL.
     */
    protected function getPurchaseUrl(): string
    {
        $configured = AppConfiguration::where('key', 'kirani_purchase_url')->value('value');

        return $configured ?: 'https://backend.kiraniapp.com/api/agent/credit/distribute';
    }

    /**
     * Normalize error messages for user display.
     */
    protected function normalizeError(string $message): string
    {
        // Hide sensitive information from error messages
        if (stripos($message, 'insufficient') !== false) {
            return 'Service temporarily unavailable. Please try again later.';
        }

        if (strlen($message) > 200) {
            return substr($message, 0, 200) . '...';
        }

        return $message;
    }
}

