<?php

namespace App\Actions\APIs\Simserver;

use GuzzleHttp\Client;
use App\Models\Transaction;
use Illuminate\Support\Str;
use App\Models\TransactionApi;
use App\Models\DataTransaction;
use Illuminate\Support\Facades\Log;
use App\Actions\Utils\ReverseTransaction;
use GuzzleHttp\Exception\ClientException;

class Data
{
    public function handle(Transaction $transaction, DataTransaction $dataTransaction, TransactionApi $api = null)
    {
        $reverseTransaction = new ReverseTransaction();
        $client = new Client();

        $apiToken = cs_decrypt(config('settings.transaction_api_token'));
        $apiUrl = config('settings.transaction_api_url');

        $data = [
            "process" => "buy",
            "recipient" => $dataTransaction->phone_number,
            "product_code" => $dataTransaction->plan->api_plan_id,
            "amount" => "250",
            "callback" => "https://app.smartdatalinks.ng/status.php",
            "user_reference" => $transaction->reference,
            'api_key' => $apiToken
        ];

        if (config('app.enable_standalone_api')) {
            $data['api_key'] = $api->token;
            $apiUrl = $api->url;
            $data['product_code'] = $dataTransaction->plan->apis->where('transaction_api_id', $api->id)->first()->product_code;
        }

        try {
            $response = $client->post($apiUrl, [
                'headers' => [
                    'Accept' => 'application/json',
                    'X-Requested-With' => 'XMLHttpRequest',
                ],
                'json' => $data,
                'withCredentials' => true,
            ]);

            $res = json_decode($response->getBody(), true);

            Log::info($res);

            if (isset($res['status']) && isset($res['data'])) {
                $apiResponse = $res['data']['true_response'] ?? 'No response message';

                if ($res['status'] && $res['data']['text_status'] === 'success') {
                    $transaction->update([
                        'status' => 'success',
                        'vending_medium' => $api ? $api->name : 'Simserver Api',
                        'api_response' => $apiResponse,
                    ]);
                } elseif ($res['status'] && $res['data']['text_status'] === 'pending') {
                    $transaction->update([
                        'status' => 'success',
                        'vending_medium' => $api ? $api->name : 'Simserver Api',
                        'api_response' => manuResponse(Str::upper($dataTransaction->plan->size."".$dataTransaction->plan->volume), $dataTransaction->phone_number),
                    ]);
                } else {
                    $reverseTransaction->handle($transaction, 'api: ' . $apiResponse);
                }
            } else {
                $reverseTransaction->handle($transaction, 'api: Invalid response structure');
            }
        } catch (ClientException $e) {
            $responseBody = $e->getResponse()->getBody(true);
            $error = json_decode($responseBody, true);

            Log::error('ClientException: ' . $e->getMessage());
            Log::error('Response Body: ' . $responseBody);

            $reverseTransaction->handle($transaction, 'api: ' . $apiResponse);

        } catch (\Exception $e) {
            $error = $e->getMessage();
            Log::error('Exception: ' . $error);

            $reverseTransaction->handle($transaction, 'api: Exception');
        }

        return $transaction->status;
    }
}


 function manuResponse($plan, $phone) {
        return "Dear Customer, You have successfully shared $plan Data to $phone. Thankyou";
}
