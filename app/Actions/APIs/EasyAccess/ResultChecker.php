<?php

namespace App\Actions\APIs\EasyAccess;

use App\Actions\Utils\ReverseTransaction;
use App\Models\ResultCheckerTransaction;
use App\Models\Transaction;
use App\Models\TransactionApi;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class ResultChecker
{
    public function handle(Transaction $transaction, ResultCheckerTransaction $resultCheckerTransaction, TransactionApi $api = null)
    {
        $reverseTransaction = new ReverseTransaction();
        $client = new Client();
        $apiToken = $api->token ?? config('settings.transaction_api_token');
        $pinCount = $resultCheckerTransaction->quantity;

        $service = [
            "WAEC" => "waec_v2.php",
            "NECO" => "neco_v2.php",
            "NABTEB" => "nabteb_v2.php"
        ];

        $serviceId = $service[$resultCheckerTransaction->exam_type];

        try {
            $response = $client->post($api->url . "/" . $serviceId, [
                'headers' => [
                    'AuthorizationToken' => $apiToken,
                    'Accept' => 'application/json',
                ],
                'form_params' => [
                    'no_of_pins' => $pinCount,
                ],
            ]);

            $res = json_decode($response->getBody(), true);

            Log::info($res);

            if (isset($res['success']) && $res['success'] === 'true') {
                $purchasedPins = [];

                // Handle multiple pins
                for ($i = 1; $i <= $pinCount; $i++) {
                    $pinKey = "pin" . ($i === 1 ? "" : $i);  // 'pin', 'pin2', 'pin3', etc.
                    if (isset($res[$pinKey])) {
                        $pinData = explode("<=>", $res[$pinKey]);
                        $purchasedPins[] = [
                            'pin' => $pinData[0],
                            'sn' => $pinData[1] ?? null,  // Serial number, if available
                        ];
                    }
                }

                // Prepare a formatted description for transaction logs
                $description = $resultCheckerTransaction->exam_type . " E-pin was Successful. PIN(s): " . implode(', ', array_map(function ($pin) {
                    return $pin['pin'] . (isset($pin['sn']) ? " (SN: " . $pin['sn'] . ")" : "");
                }, $purchasedPins));

                // Update transaction as successful
                $transaction->update([
                    'status' => 'success',
                    'api_response' => $res['message'] ?? 'Transaction successful!',
                    'description' => $description
                ]);

                $resultCheckerTransaction->update([
                    'pins' => $purchasedPins,
                ]);

            } elseif (isset($res['success']) && $res['success'] === 'false') {
                // Handle specific failure cases
                switch ($res['message']) {
                    case "Invalid Authorization Token":
                        Log::error("Failed WAEC API call: Invalid Authorization Token");
                        break;
                    case "Insufficient Balance":
                        Log::error("Failed WAEC API call: Insufficient Balance");
                        break;
                    case "No. of pins out of range allowed. Kindly note that valid values are 1,2,3,4,5,10":
                        Log::error("Failed WAEC API call: Invalid number of pins");
                        break;
                    default:
                        Log::error("Failed WAEC API call: " . $res['message']);
                }
                // Reverse the transaction in case of failure
                $reverseTransaction->handle($transaction, $res['message']);
            }
        } catch (\Exception $e) {
            // Exception handling: Reverse transaction and log error
            $reverseTransaction->handle($transaction, 'Connection Exception!');
            Log::error($e->getMessage());
        }

        return $transaction->status;
    }
}
