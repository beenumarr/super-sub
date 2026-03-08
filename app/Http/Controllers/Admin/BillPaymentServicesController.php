<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Models\AppConfiguration;
use App\Http\Controllers\Controller;
use App\Models\ElectricityDistributor;
use App\Http\Resources\ElectricityDistributorResource;

class BillPaymentServicesController extends Controller
{


    public function index()
    {
        return ElectricityDistributor::all();

    }

    public function show(ElectricityDistributor $bill_payment_service)
    {
        return new ElectricityDistributorResource($bill_payment_service);

    }

    public function update(Request $request)
    {

        $services = $request->services;

        // $request->validate([
        //     'electricicty_bill_transaction_api_id' => 'required|string',
        // ]);

        if($request->electricicty_bill_transaction_api_id){
            AppConfiguration::updateOrCreate(
                ['key' => 'electricicty_bill_transaction_api_id'], // The attributes to search for
                ['value' => $request->electricicty_bill_transaction_api_id] // The attributes to update or create
            );

        }


        foreach ($services as $value) {
            $service = ElectricityDistributor::where('name', $value['name'])->first();

            if ($service) {
                $service->active = $value['active'];
                $service->code = $value['code'];
                $service->api_id = $value['api_id'];
                $service->save();
            }
        }

        return redirect()->back();

    }


}
