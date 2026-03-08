<?php

namespace App\Actions\APIs\VtPass;

use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\TransactionApi;
use App\Models\AirtimeTransaction;
use Illuminate\Support\Facades\Log;
use App\Actions\Utils\TransactionHelpers;

class Airtime
{
    public function handle(Transaction $transaction, AirtimeTransaction $airtimeTransaction, TransactionApi $api = null)
    {
        $client = new Client();
        $helper = new TransactionHelpers();

        $requestId = $helper->generateVtPassRequestId();

        $data = [
            "request_id" => $requestId,
            "serviceID" => $airtimeTransaction->network->code,
            "amount" => $airtimeTransaction->amount,
            "phone" => $airtimeTransaction->phone_number,
        ];

        try {
            $response = $client->post("$api->url/pay", [
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode("$api->username:$api->password"),
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $res = json_decode($response->getBody(), true);
            Log::info($res, $data);

            $this->handleResponse($res, $transaction, $airtimeTransaction, $helper, $requestId);

        } catch (\Exception $e) {
            $helper->reverseTransaction($transaction, $requestId);
            $error = $e->getMessage();
            Log::error($error);
        }

        return $transaction->status;
    }

    private function handleResponse($res, $transaction, $airtimeTransaction, $helper, $requestId)
    {
        switch ($res['code']) {
            case "000":
                if ($res['response_description'] === 'TRANSACTION SUCCESSFUL') {
                    $transaction->update([
                        'status' => 'success',
                        'api_response' => $res['ident'] ?? 'Success ' . $requestId
                    ]);
                }

                break;

            case "099":

                if ($res['response_description'] === 'TRANSACTION SUCCESSFUL') {
                    $transaction->update([
                        'status' => 'pending',
                        'api_response' => $res['ident'] ?? 'Processing ' . $requestId
                    ]);
                }
                break;

            case "044":
                // Handle transaction resolved status here
                Log::info('Transaction resolved', ['requestId' => $requestId]);
                break;

            case "091":
                $helper->reverseTransaction($transaction, $res['ident'] ?? 'Not processed ' . $requestId);
                break;

            case "016":
                $helper->reverseTransaction($transaction, $res['ident'] ?? 'Failed ' . $requestId);
                break;

            case "010":
            case "011":
            case "012":
            case "013":
            case "014":
            case "015":
            case "017":
            case "018":
            case "019":
            case "021":
            case "022":
            case "023":
            case "024":
            case "025":
            case "026":
            case "027":
            case "030":
            case "031":
            case "032":
            case "034":
            case "035":
            case "040":
            case "083":
            case "085":
                $this->handleError($res['code'], $res['response_description'], $transaction, $helper, $requestId);
                break;

            default:
                $helper->reverseTransaction($transaction, $res['ident'] ?? 'Unknown error ' . $requestId);
                Log::error('Unhandled response code', ['response' => $res]);
                break;
        }
    }

    private function handleError($code, $description, $transaction, $helper, $requestId)
    {

        $helper->reverseTransaction($transaction, $description . ' (' . $code . ')' . $requestId);

        Log::error('Transaction failed', ['code' => $code, 'description' => $description, 'requestId' => $requestId]);
    }
}
