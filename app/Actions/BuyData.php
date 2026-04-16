<?php

namespace App\Actions;

use App\Models\Transaction;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;

class BuyData
{


    public function handle(Transaction $transaction)
    {

        if (config('app.test_mode')) {
            $transaction->update(['status' => 'SUCCESS', 'api_response' => 'Success Test Mode']);
            return 'SUCCESS';
        }

        $apiModel = null;

        if(config('app.enable_standalone_api')){


            $plan = $transaction->transactionable->plan;

            $apiModel = $plan->planType->api;

            if($plan->enable_custom_vending_api && $plan->custom_api_vending_id){

                try{

                $planApiModel = TransactionApi::find($plan->custom_api_vending_id);

                    if($planApiModel){



                        $apiModel = $planApiModel;



                    }



                }catch(\Exception $e){
                    $apiModel = $plan->planType->api;
                    Log::error('Error fetching custom API model: ' . $e->getMessage());
                }

            }


            $apiClassName = 'App\\Actions\\'.$apiModel->model . 'Data';



        }
        else{

            if(config('settings.transaction_api_type') === 'Smartteck'){

                $apiClassName = 'App\\Actions\\APIs\\SmartTech\\Data';

            }else{

                $apiClassName = 'App\\Actions\\APIs\\Default\\Data';

            }

        }

        // dd($apiClassName);

        $api = new $apiClassName();


        $api->handle($transaction, $transaction->transactionable, $apiModel);


        return $transaction->status;

    }


}
