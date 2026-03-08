<?php

namespace App\Jobs;

use App\Models\AirtimeTransaction;
use GuzzleHttp\Client;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;


class BuyAirtimeApi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $transaction;
    public $airtimeTransaction;
    /**
     * Create a new job instance.
     */
    public function __construct(Transaction $transaction, AirtimeTransaction $airtimeTransaction)
    {
        $this->transaction = $transaction;
        $this->airtimeTransaction = $airtimeTransaction;
    }

    /**
     * Execute the job.
     */
    public function handle() : void
    {
        $data = [
            "network"=> $this->airtimeTransaction->network->api_network_idrk_id,
            "amount"=>$this->airtimeTransaction->amount,
            "mobile_number"=> $this->airtimeTransaction->phone_number,
            "Ported_number"=>false,
            "airtime_type"=>"VTU"
        ];

        $client = new Client();
        $url = config('settings.transaction_api_url');
        $token = config('settings.transaction_api_token');

        try {
            $response = $client->post("$url/topup/", [
                'headers' => [
                    'Authorization' => "Token $token",
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $res = json_decode($response->getBody(), true);

            Log::info($res);

            if ($res['Status'] === 'successful') {

                $this->airtimeTransaction->transaction()->update([
                    'status'=> 'success',
                    'api_response' => $res['api_response']

                ]);

            }

        } catch (\Exception $e) {

            // if ($this->podcast->fileDoesntExists()) {

                // $this->fail();
            // }

            $error = $e->getMessage();

            Log::error($error );

            $this->airtimeTransaction->transaction()->update([
                'status'=> 'failed',
                'api_response' => $error
            ]);



        }
    }


}
