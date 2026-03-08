<?php

namespace App\Actions\APIs\VtPass;

use GuzzleHttp\Client;
use App\Models\Transaction;
use Illuminate\Support\Str;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;
use App\Actions\Utils\TransactionHelpers;
use App\Models\CableSubscriptionTransaction;
use Illuminate\Validation\ValidationException;



class Cable
{


    public function handle(Transaction $transaction, CableSubscriptionTransaction $cableSubscriptionTransaction, TransactionApi $api = null)
    {
        $client = new Client();
        $helper = new TransactionHelpers();
        $requestId = $helper->generateVtPassRequestId();


        $cable_name = $cableSubscriptionTransaction->network->name;
        $cable = $cable_name  === 'STARTIME'? 'startimes' : $cable_name;

        $api_id = $cableSubscriptionTransaction->plan->apis->where('transaction_api_id', $api->id)->first();

        if(!$api_id){

            $helper->reverseTransaction($transaction, $requestId);

            throw ValidationException::withMessages([
                'status' => 'Invalid Variation Code!.',
            ]);

        }

        $data = [
            "request_id"=> $requestId,
            "billersCode"=> $cableSubscriptionTransaction->smart_card_number,
            "serviceID"=> Str::lower($cable),
            "variation_code"=> $api_id->product_code,
            "amount"=> $cableSubscriptionTransaction->plan->amount,
            "phone"=> $cableSubscriptionTransaction->phone_number,
        ];



        try {
            // to convert to reusable
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
                    'api_response' => $res['ident'] ?? 'Succees '.$requestId
                ]);


            }else{

                $helper->reverseTransaction($transaction, $res['ident'] ?? 'Failed '.$requestId);


            }

        } catch (\Exception $e) {

            $helper->reverseTransaction($transaction, $requestId);

            $error = $e->getMessage();

            Log::error($error );


        }

        return $transaction->status;
    }


}
