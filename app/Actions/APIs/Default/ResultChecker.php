<?php

namespace App\Actions\APIs\Default;

use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;
use App\Actions\Utils\ReverseTransaction;
use App\Models\ResultCheckerTransaction;

class ResultChecker
{
    public function handle(Transaction $transaction, ResultCheckerTransaction $resultCheckerTransaction, TransactionApi $api = null)
    {
        $client = new Client();
        $reverseTransaction = new ReverseTransaction();
        $purchasedPins = [];
        $pinCount = $resultCheckerTransaction->quantity;

        $data = [
            "exam_name" => $resultCheckerTransaction->exam_type,
            "quantity" => $pinCount,
        ];

        $apiToken = config('app.enable_standalone_api') ? $api->token : cs_decrypt(config('settings.transaction_api_token'));
        $apiUrl = config('app.enable_standalone_api') ? $api->url : config('settings.transaction_api_url');

        try {
            $response = $client->post("$apiUrl/api/epin/", [
                'headers' => [
                    'Authorization' => "Token $apiToken",
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);
            $res = json_decode($response->getBody(), true);

            // $res = [ // Sample response for testing
            //     'exam_name' => 'NABTEB',
            //     'pins' => ['525288563346<=>NRCP10469882'],
            //     'quantity' => 1,
            //     'id' => 29562,
            //     'Status' => 'successful',
            //     'previous_balance' => '2095.60',
            //     'data' => '{"success":"true","message":"E-pin was Successful","pin":"525288563346<=>NRCP10469882","amount":830,"transaction_date":"29-10-2024 10:42:13 am","reference_no":"ID69232238205","status":"Successful"}',
            //     'after_balance' => '1240.60',
            //     'amount' => 855.0,
            //     'create_date' => '2024-10-29T10:42:13.480661',
            // ];

            if ($res['Status'] === 'successful') {
                foreach ($res['pins'] as $pinData) {
                    $pinParts = explode("<=>", $pinData);
                    $purchasedPins[] = [
                        'pin' => $pinParts[0],
                        'sn' => $pinParts[1] ?? null,
                    ];
                }

                $description = "{$resultCheckerTransaction->exam_type} E-pin was Successful. PIN(s): " . implode(', ', array_map(
                    fn($pin) => "{$pin['pin']}" . ($pin['sn'] ? " (SN: {$pin['sn']})" : ""),
                    $purchasedPins
                ));

                $transaction->update([
                    'status' => 'success',
                    'api_response' => $res['data'] ?? 'Transaction successful!',
                    'description' => $description,
                ]);

                $resultCheckerTransaction->update(['pins' => $purchasedPins]);

            } else {
                $transaction->update(['status' => 'failed']);
                $reverseTransaction->handle($transaction);
                Log::warning("Transaction failed: {$res['Status']}");
            }

        } catch (\Exception $e) {
            $transaction->update(['status' => 'failed']);
            $reverseTransaction->handle($transaction);

            $error = $e->getMessage();
            Log::error("API Request failed: $error");

            $errorResponse = $this->parseErrorResponse($error);
            $transaction->update(['api_response' => $errorResponse]);
        }

        return $transaction->status;
    }

    /**
     * Parse error response from exception message.
     *
     * @param string $error
     * @return string
     */
    private function parseErrorResponse(string $error): string
    {
        preg_match('/response:\s+(.*?)$/i', $error, $matches);
        $apiResponse = json_decode($matches[1] ?? '', true);

        if (isset($apiResponse['error'][0])) {
            $errorMessage = $apiResponse['error'][0];
            return strpos($errorMessage, "insufficient balance") !== false ? "Transaction Failed: Insufficient balance" : $errorMessage;
        }

        return "No specific error message found.";
    }
}
