<?php

namespace App\Services;

use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\AirtimeTransaction;
use Illuminate\Support\Facades\Log;
use App\Models\AirtimeToCashTransaction;
use App\Actions\Utils\ReverseTransaction;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Validation\ValidationException;

class AutoPilotService
{
    protected $client;
    protected $reverseTransaction;
    protected $helpers;
    protected $apiToken;
    protected $apiUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->reverseTransaction = new ReverseTransaction();
        $this->helpers = new TransactionHelper();
        $this->apiToken = config('app.autopilot_api_key');
        $this->apiUrl = config('app.autopilot_api_url');
    }

    public function sendAirtimeToCashOtp($network, $senderNumber)
    {
        return $this->sendRequest('/v1/send-resend/auto-airtime-to-cash-otp', [
            'network' => $network,
            'senderNumber' => $senderNumber,
        ]);
    }

    public function verifyAirtimeToCashOtp($otp, $identifier)
    {
        return $this->sendRequest('/v1/verify/auto-airtime-to-cash-otp', [
            'identifier' => $identifier,
            'otp' => $otp,
        ]);
    }

    public function sendAirtimeToCash($data, AirtimeToCashTransaction $transaction)
    {
        try {

            // testing

            // $transaction->update([
            //     'api_response' => 'testing',
            //     'status' => 'completed',
            // ]);

            // return $transaction;


            // $network = $transaction->network;

            // $api = TransactionApi::where('id', $network->airtime_to_cash_api_id)->first();
            // $this->apiUrl = $api->api_url;
            // $this->apiToken = $api->api_key;



            $response = $this->sendRequest('/v1/send-airtime/auto-airtime-to-cash', [
                'network' => $transaction->mobile_network_id,
                'amount' => $transaction->amount,
                'quantity' => "1",
                'pin' => $data['pin'],
                'sessionId' => $data['sessionId'],
                'reference' => $this->generateRef($transaction->reference),
            ]);

            info('Airtime to Cash Response: ', $response);

            if (!isset($response['status']) || !$response['status']) {
                Log::error('OTP verification failed', ['response' => $response]);
                throw ValidationException::withMessages([
                    'otp' => $response['message'] ?? 'OTP verification failed. Please try again.',
                ]);
            }

            if (isset($response['code']) && $response['code'] != 200) {
                $transaction->update([
                    ...$response['data']['info'],
                    'api_response' => $response['data']['details'][0]['message'],
                ]);

                Log::error('Airtime to Cash failed', ['response' => $response]);
                throw ValidationException::withMessages([
                    'status' => $response['data']['details'][0]['message'] ?? 'Failed. Please try again.',
                ]);
            }

            if (isset($response['data'])) {

                $transactionStatus = $this->determineTransactionStatus($response['data']['info']);

                $transaction->update([
                    ...$response['data']['info'],
                    'api_response' => $response['data']['details'][0]['message'],
                    'status' => $transactionStatus,
                ]);

            }

            return $transaction;
        } catch (\Exception $e) {
            Log::error('Exception in sendAirtimeToCash: ' . $e->getMessage());
            $message = $e->getMessage();
            $transaction->update([
                'api_response' => $message ?? 'An error occurred while processing your request. Please try again later.',
                'status' => 'failed',
            ]);
            throw ValidationException::withMessages([
                'error' => $message ?? 'An error occurred while processing your request. Please try again later.',
            ]);
        }
    }

    private function determineTransactionStatus($info)
    {
        if ($info['success'] > 0 && $info['failed'] === 0) {
            return 'completed';
        } elseif ($info['failed'] > 0 && $info['success'] > 0) {
            return 'processing';
        } else {
            return 'unsure';
        }
    }

    private function sendRequest($endpoint, $data)
    {
        try {
            $response = $this->client->post($this->apiUrl . $endpoint, [
                'headers' => [
                    'Authorization' => "Bearer {$this->apiToken}",
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            return json_decode($response->getBody(), true);
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            Log::error('ClientException: ' . $e->getMessage());
            return ['error' => 'ClientException: ' . $e->getMessage()];
        } catch (\Exception $e) {
            Log::error('Exception: ' . $e->getMessage());
            return ['error' => 'Exception: ' . $e->getMessage()];
        }
    }


    public function generateRef($ref) {
        $number = now()->year.$ref;
        return $number;
    }
}
