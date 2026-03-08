<?php

namespace App\Actions;

use App\Models\TransactionApi;

class ValidateMeter
{

    public function handle($meter_number, $disco_name, $meter_type)
    {

        if(config('app.test_mode')){
            return [
                'status'=> 'success',
                'name'=> 'User Test Mode',
                'address'=> 'User Test Mode Address',
            ];
        }

        $apiModel = null;

        if(config('app.enable_standalone_api') && config('settings.electricicty_bill_transaction_api_id')){

            $apiModel = TransactionApi::find(config('settings.electricicty_bill_transaction_api_id')); //! Error handle needed here

            $apiClassName = 'App\\Actions\\'.$apiModel->model . 'ValidateMeter';

        }
        else{

            if(config('settings.transaction_api_type') === 'Smartteck'){

                $apiClassName = 'App\\Actions\\APIs\\SmartTech\\ValidateMeter';

            }else{

                $apiClassName = 'App\\Actions\\APIs\\Default\\ValidateMeter';

            }

        }


        $api = new $apiClassName();

        $response = $api->handle($meter_number, $disco_name, $meter_type, $apiModel);

        return $response;

    }


}
