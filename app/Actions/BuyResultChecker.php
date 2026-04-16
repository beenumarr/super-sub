<?php

namespace App\Actions;
use App\Models\Transaction;
use App\Models\TransactionApi;



class BuyResultChecker
{

    public function handle(Transaction $transaction)
    {

        if(config('app.test_mode')){
            $transaction->update(['status'=> 'SUCCESS','api_response' => 'Success Test Mode']);
            return 'SUCCESS';
        }

        $apiModel = null;

        if(config('app.enable_standalone_api')){

            $apiId =  $transaction->transactionable->examType->transaction_api_id;

            $apiModel = TransactionApi::find($apiId);

            $apiClassName = 'App\\Actions\\'.$apiModel->model . 'ResultChecker';

        }
        else{

            if(config('settings.transaction_api_type') === 'Smartteck'){

                $apiClassName = 'App\\Actions\\APIs\\SmartTech\\ResultChecker';

            }else{

                $apiClassName = 'App\\Actions\\APIs\\Default\\ResultChecker';

            }

        }


        $api = new $apiClassName();

        $api->handle($transaction, $transaction->transactionable, $apiModel);

        return $transaction->status;

    }


}
