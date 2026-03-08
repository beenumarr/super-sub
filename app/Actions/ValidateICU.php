<?php

namespace App\Actions;

use App\Models\CableNetwork;
use App\Models\TransactionApi;



class ValidateICU
{


    public function handle($smart_card_number, $cable_name)
    {

        if(config('app.test_mode')){
            return [
                'name'=> 'User Test Mode',
                'address'=> 'User Test Mode Address',
                'status'=> 'success',
            ];
        }


        $apiModel = null;

        if(config('app.enable_standalone_api')){

            $cableNetwork = CableNetwork::where('name', $cable_name)->first();

            $apiModel = TransactionApi::find($cableNetwork->transaction_api_id); //! Error handle needed here

            $apiClassName = 'App\\Actions\\'.$apiModel->model . 'ValidateICU';

        }
        else{

            if(config('settings.transaction_api_type') === 'Smartteck'){

                $apiClassName = 'App\\Actions\\APIs\\SmartTech\\ValidateICU';

            }else{

                $apiClassName = 'App\\Actions\\APIs\\Default\\ValidateICU';

            }

        }


        $api = new $apiClassName();



        $response = $api->handle($smart_card_number, $cable_name, $apiModel);

        return $response;

    }


}
