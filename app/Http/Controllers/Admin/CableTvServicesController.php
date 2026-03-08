<?php

namespace App\Http\Controllers\Admin;

use App\Models\CableNetwork;
use App\Models\DataPlanType;
use Illuminate\Http\Request;
use App\Models\MobileNetwork;
use App\Http\Controllers\Controller;
use App\Http\Resources\CableNetworkResource;
use App\Http\Resources\MobileNetworkResource;

class CableTvServicesController extends Controller
{


    public function index()
    {
        return CableNetwork::all();

    }

    public function show(CableNetwork $cable_tv_service)
    {
        return new CableNetworkResource($cable_tv_service);

    }

    public function update(Request $request)
    {

        $services = $request->services;

        foreach ($services as $value) {
            $service = CableNetwork::where('name', $value['name'])->first();

            if ($service) {
                $service->active = $value['active'];
                $service->code = $value['code'];
                $service->transaction_api_id = $value['transaction_api_id'];
                $service->save();
            }
        }

        return redirect()->back();

    }


}
