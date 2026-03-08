<?php

namespace App\Actions\APIs\ArewaGlobal;

use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\TransactionApi;
use App\Models\DataTransaction;
use Illuminate\Support\Facades\Log;
use App\Actions\Utils\ReverseTransaction;
use App\Utils\Transaction\TransactionHelper;


class Data
{

    public function handle(Transaction $transaction, DataTransaction $dataTransaction, TransactionApi $api = null, $actype = "AccountNumber")
    {
        $reverseTransaction = new ReverseTransaction();
          $client = new Client([
            'timeout' => 180, // Increase to 30, 60, or even 90 seconds (adjust based on typical API response times)
            'connect_timeout' => 10, // Timeout for connecting to the server
        ]);
        $helpers = new TransactionHelper();

        // Format phone number with country code (234)
        $phoneNumber = $dataTransaction->phone_number;
        if (!str_starts_with($phoneNumber, '234') && $actype == 'PhoneNumber') {
            $phoneNumber = '234' . ltrim($phoneNumber, '0');
        }

        // Get bundle code (plan code)
        $bundleTypeCode = $dataTransaction->plan->api_plan_id;

       
        $planDetails = $dataTransaction->plan->apis->where('transaction_api_id', $api->id)->first();
        $bundleTypeCode = $planDetails ? $planDetails->product_code : $bundleTypeCode;
        $apiToken = $api->token;
        $apiUrl = $api->url;
        


        // Validate actype is one of the allowed values
        if (!in_array($actype, ['AccountNumber', 'PhoneNumber'])) {
            $actype = 'AccountNumber';
        }

        // Prepare request data according to new API documentation
        $data = [
            "PhoneNumber" => $phoneNumber,
            "BundleTypeCode" => (string) $bundleTypeCode,
            "actype" => $actype,
        ];

        try {
            $response = $client->post("$apiUrl/api/smile-data/", [
                'headers' => [
                    'Authorization' => "Token $apiToken",
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $res = json_decode((string) $response->getBody(), true);
            $statusCode = $response->getStatusCode();

            Log::info('ArewaGlobal Smile Bundle Response: ', ['res' => $res, 'code' => $statusCode]);

            // Check for success status (201 Created or status === 'success')
            if (($statusCode === 201 || ($statusCode === 200 && isset($res['status']) && $res['status'] === 'success'))) {
                $transaction->update([
                    'status' => 'success',
                    'vending_medium' => $api ? $api->name : 'Default Api',
                    'api_response' => $res['msg'] ?? $res['message'] ?? 'Transaction Successful',
                ]);
            } else {
                $reverseTransaction->handle($transaction, [
                    'api_response' => $res['msg'] ?? $res['message'] ?? 'Transaction failed',
                ]);
            }
        } catch (\GuzzleHttp\Exception\ClientException $e) {

            $res = $e->getResponse();
            $body = $res ? (string) $res->getBody() : null;
            $decoded = $body ? json_decode($body, true) : null;

            $message = $this->normalizeApiError($body, $e->getMessage());


            $reverseTransaction->handle($transaction, ['api_response'=> $message]);

            Log::error('Response Body: ' . $message);


        } catch (\GuzzleHttp\Exception\ServerException $e) {
            $res = $e->getResponse();
            $body = $res ? (string) $res->getBody() : null;
            $decoded = $body ? json_decode($body, true) : null;

            $message = $decoded['message'] ?? $e->getMessage();
            $statusCode = $res ? $res->getStatusCode() : null;

            // Handle 504 Gateway Timeout specifically
            if ($statusCode == 504) {
                $transaction->update([
                    'status' => 'pending',
                    'api_response' => 'Your transaction is being processed. Thank you for your patience.',
                ]);

                Log::error('504 Gateway Timeout: Transaction set to pending - ' . $message);
            } else {
                $reverseTransaction->handle($transaction, ['api_response'=> $message]);
                Log::error('Server Exception: ' . $message);
            }

            // Do not reverse the transaction for server errors
        } catch (\Exception $e) {

            // Reverse the transaction only for general exceptions
            $reverseTransaction->handle($transaction);

            // Handle general exception
            $error = $e->getMessage();


            $transaction->update([
                'api_response' => 'Exception: ' . $error,
            ]);

            Log::error('Exception: ' . $error);
        }


        return $transaction->status;
    }


    protected function normalizeApiError($body, $exceptionMessage = null): string
{
    $rawMessage = null;

    try {
        if ($body) {
            $decoded = json_decode($body, true, 512, JSON_THROW_ON_ERROR);

            if (isset($decoded['message'])) {
                $rawMessage = $decoded['message'];
            } elseif (isset($decoded['error'])) {
                $rawMessage = is_array($decoded['error'])
                    ? implode(', ', array_map('strval', $decoded['error']))
                    : (string) $decoded['error'];
            }
        }
    } catch (\Throwable $e) {
        // If JSON parse fails, fallback to body if it's a string
        $rawMessage = is_string($body) ? $body : null;
    }

    // Fallback if still empty
    if (!$rawMessage && $exceptionMessage) {
        $rawMessage = $exceptionMessage;
    }
    if (!$rawMessage) {
        $rawMessage = 'An unexpected error occurred.';
    }

    // Normalization rules for user-facing response
    $safeMessage = 'Something went wrong. Please try again later.';

    if (str_contains(strtolower($rawMessage), 'insufficient')) {
        return $safeMessage;
    }

    // Truncate long strings to avoid flooding UI
    return mb_strlen($rawMessage) > 200
        ? mb_substr($rawMessage, 0, 200) . '...'
        : $rawMessage;
}



}
