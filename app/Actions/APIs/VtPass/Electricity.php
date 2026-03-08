<?php

namespace App\Actions\APIs\VtPass;

use DateTimeZone;
use Carbon\Carbon;
use GuzzleHttp\Client;
use App\Models\Transaction;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;
use App\Models\ElectricityBillTransaction;



class Electricity
{


    public function handle(Transaction $transaction, ElectricityBillTransaction $electricityBillTransaction, TransactionApi $api = null)
    {


        $data = [
            "request_id"=> $this->generateRequestId(),
            "billersCode"=> $electricityBillTransaction->meter_number,
            "serviceID"=> $electricityBillTransaction->distributor->code,
            "variation_code"=> $electricityBillTransaction->meter_type,
            "amount"=> $transaction->amount,
            "phone"=> $electricityBillTransaction->phone_number,
        ];

        $client = new Client();
        $url = $api->url; // "https://sandbox.vtpass.com/api" : "https://api-service.vtpass.com/api/";

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


            if ($res['code'] === "000" && $res['response_description'] ==='TRANSACTION SUCCESSFUL') {

                $transaction->update([
                    'status'=> 'success',
                    'api_response' => $res['ident'] ?? 'Succees'
                ]);

                $electricityBillTransaction->update([
                    'token' => $res['purchased_code'] ?? ''
                ]);

            }

        } catch (\Exception $e) {

            $error = $e->getMessage();

            Log::error($error );


            $pattern = '/response:\s+(.*?)$/i';
            preg_match($pattern, $error, $matches);
            $api_res = $matches[1] ?? null;

            $api_response = $api_res;

            $me = json_decode($api_res);

            if($me->error[0] === 'You can\'t topup due to insufficient balance  ₦22.0 '){
                $api_response = 'No response';
            }

            $transaction->update([
                'status'=> 'failed',
                'api_response' => $api_response
            ]);


            $wallet = auth()->user()->wallet;

            $wallet->increment('balance', $transaction->amount);

            $transaction->increment('balance_after', floatval($transaction->amount));

        }

        return $transaction->status;
    }


    private function generateRequestId() {
        $currentDateTime = Carbon::now(new DateTimeZone('Africa/Lagos')); // Set timezone to Africa/Lagos (GMT+1)
        $datePortion = $currentDateTime->format('YmdHi');
        $additionalString = substr(uniqid(), 2, 12); // Using the first 10 characters of uniqid

        // dd($additionalString);

        // Ensure the request ID is at least 12 characters long
        $requestId = $datePortion . $additionalString;
        if (strlen($requestId) < 12) {
            throw new \InvalidArgumentException('Request ID length must be 12 characters or more.');
        }

        return $requestId;

    }

}
