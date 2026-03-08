<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\ElectricityDistributor;
use App\Models\FundingMethod;

class WalletFundingServicesController extends Controller
{


    public function index()
    {
        return FundingMethod::all();

    }

    public function update(Request $request)
    {

        $services = $request->services;

        foreach ($services as $value) {
            $service = FundingMethod::where('name', $value['name'])->first();

            if ($service) {
                $service->active = $value['active'];
                $service->save();
            }
        }

        return redirect()->back();

    }


}
