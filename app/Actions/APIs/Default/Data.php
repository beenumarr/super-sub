<?php

namespace App\Actions\APIs\Default;

use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\TransactionApi;
use App\Models\DataTransaction;
use Illuminate\Support\Facades\Log;
use App\Actions\Utils\ReverseTransaction;
use App\Utils\Transaction\TransactionHelper;


class Data
{

    public function handle(Transaction $transaction, DataTransaction $dataTransaction, TransactionApi $api = null)
    {
        $reverseTransaction = new ReverseTransaction();
          $client = new Client([
            'timeout' => 180, // Increase to 30, 60, or even 90 seconds (adjust based on typical API response times)
            'connect_timeout' => 10, // Timeout for connecting to the server
        ]);
        $helpers = new TransactionHelper();

        $isStandalon = config('app.enable_standalone_api');

        $data = [
            "network"=> $dataTransaction->network->api_network_id,
            "mobile_number"=> $dataTransaction->phone_number,
            "plan"=> $dataTransaction->plan->api_plan_id,
            "Ported_number"=> true,
        ];

        if($isStandalon){
            $networkId = $helpers->getNetworkId($api, $dataTransaction->network);
            $planId = $dataTransaction->plan->apis->where('transaction_api_id', $api->id)->first()->product_code;
            $apiToken = $api->token;
            $apiUrl = $api->url;
            $data['plan'] = $planId;
            $data['network'] = $networkId;

        }else{

            $apiToken = cs_decrypt(config('settings.transaction_api_token'));
            $apiUrl = config('settings.transaction_api_url');

        }



        try {
            $response = $client->post("$apiUrl/api/data/", [
                'headers' => [
                    'Authorization' => "Token $apiToken",
                    'Accept' => 'application/json',
                    'X-Requested-With' => 'XMLHttpRequest',
                ],
                'json' => $data,
                'withCredentials' => true,
            ]);

            $res = json_decode($response->getBody(), true);

            Log::error('Response Body Post: ', ['res' => $res, 'code' => $response->getStatusCode()]);

            if ($res['Status'] === 'successful') {
                $transaction->update([
                    'status' => 'success',
                    'vending_medium' => $api ? $api->name : 'Default Api',
                    'api_response' => $res['api_response'] ?? 'Transaction Successful',
                ]);
            } else {
                  $reverseTransaction->handle($transaction, $res);
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
