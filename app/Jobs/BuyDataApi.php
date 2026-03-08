<?php

namespace App\Jobs;

use App\Models\User;
use GuzzleHttp\Client;
use App\Models\Channel;
use App\Models\DataTransaction;
use App\Models\FundingAccount;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Intervention\Image\Facades\Image;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Contracts\Queue\ShouldBeUnique;


class BuyDataApi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $transaction;
    public $dataTransaction;
    /**
     * Create a new job instance.
     */
    public function __construct(Transaction $transaction, DataTransaction $dataTransaction)
    {
        $this->transaction = $transaction;
        $this->dataTransaction = $dataTransaction;
    }

    /**
     * Execute the job.
     */
    public function handle() : void
    {
        $data = [
            "network"=> $this->dataTransaction->network->api_network_id,
            "mobile_number"=> $this->dataTransaction->phone_number,
            "plan"=> $this->dataTransaction->plan->api_plan_id,
            "Ported_number"=> false,
        ];

        $client = new Client();
        $url = config('settings.transaction_api_url');
        $token = config('settings.transaction_api_token');

        try {
            $response = $client->post("$url/data/", [
                'headers' => [
                    'Authorization' => "Token $token",
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            $res = json_decode($response->getBody(), true);

            Log::info($res);

            if ($res['Status'] === 'successful') {

                $this->dataTransaction->transaction()->update([
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

            $this->dataTransaction->transaction()->update([
                'status'=> 'failed',
                'api_response' => $error
            ]);



        }
    }


}
