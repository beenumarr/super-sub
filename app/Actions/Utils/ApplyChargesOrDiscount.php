<?php

namespace App\Actions;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;



class ApplyChargesOrDiscount
{
    public function __construct(Type $var = null) {
        $this->var = $var;
    }


    public function handle($service, $amount)
    {
            // get user package
            // get the service addn where user package id is the user pdi

            // get addon type: charges or discount

            // get ammount type and cal with service amount value

            // return

    }


}
