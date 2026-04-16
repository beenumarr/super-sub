<?php

namespace App\Actions;
use App\Models\Transaction;
use App\Models\TransactionApi;



class BuyCableSubscription
{

    public function handle(Transaction $transaction)
    {

        if(config('app.test_mode')){
            $transaction->update(['status'=> 'SUCCESS','api_response' => 'Success Test Mode']);
            return 'SUCCESS';
        }

        $apiModel = null;

        if(config('app.enable_standalone_api')){

            $apiModel = TransactionApi::find($transaction->transactionable->network->transaction_api_id);

            $apiClassName = 'App\\Actions\\'.$apiModel->model . 'Cable';

        }
        else{

            if(config('settings.transaction_api_type') === 'Smartteck'){

                $apiClassName = 'App\\Actions\\APIs\\SmartTech\\Cable';

            }else{

                $apiClassName = 'App\\Actions\\APIs\\Default\\Cable';

            }

        }


        $api = new $apiClassName();

        $api->handle($transaction, $transaction->transactionable, $apiModel);

        return $transaction->status;

    }


}
