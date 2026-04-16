<?php

namespace App\Actions;

use App\Models\Transaction;
use App\Models\TransactionApi;

class PayElectricityBill
{


    public function handle(Transaction $transaction)
    {

        if(config('app.test_mode')){
            $transaction->update(['status'=> 'SUCCESS','api_response' => 'Success Test Mode']);
            return 'SUCCESS';
        }

        $apiModel = null;

        if(config('app.enable_standalone_api') && config('settings.electricicty_bill_transaction_api_id')){

            $apiModel = TransactionApi::find(config('settings.electricicty_bill_transaction_api_id'));

            $apiClassName = 'App\\Actions\\'.$apiModel->model . 'Electricity';

        }
        else{

            if(config('settings.transaction_api_type') === 'Smartteck'){

                $apiClassName = 'App\\Actions\\APIs\\SmartTech\\Electricity';

            }else{

                $apiClassName = 'App\\Actions\\APIs\\Default\\Electricity';

            }

        }


        $api = new $apiClassName();

        $api->handle($transaction, $transaction->transactionable, $apiModel);

        return $transaction->status;

    }


}
