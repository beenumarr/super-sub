<?php

namespace App\Http\Controllers\Admin;

use App\Models\MobileNetwork;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\MobileNetworkResource;
use App\Models\DataPlanType;

class MobileNetworkController extends Controller
{


    public function show(MobileNetwork $mobile_network)
    {
        return new MobileNetworkResource($mobile_network);

    }

    public function update(Request $request, MobileNetwork $mobile_network)
    {

        $mobile_network->update([
            'api_network_id'=> $request->api_network_id,
            'transaction_api_id'=> $request->transaction_api_id,
            'airtime_transaction_api_id'=> $request->airtime_transaction_api_id,
            'data_active'=> $request->data_active? 1:0,
            'airtime_active'=> $request->airtime_active,
        ]);

        // Legacy per-plan-type flags are optional in the new UI – guard against nulls
        $plan_types = $request->except('data_active', 'airtime_active', 'api_network_id', 'airtime_transaction_api_id');

        if (!empty($plan_types)) {
            foreach ($plan_types as $key => $value) {
                $plan_type = $mobile_network->dataPlanTypes()->where('name', $key)->first();
                if ($plan_type) {
                    $plan_type->active = (bool) $value;
                    $plan_type->save();
                }
            }
        }

        $dataTypesVending = $request->input('data_types_vending', []);

        if (is_array($dataTypesVending)) {
            foreach ($dataTypesVending as $key => $value) {
                $plan_type = $mobile_network->dataPlanTypes()->where('name', $key)->first();
                if ($plan_type) {
                    $plan_type->transaction_api_id = $value ?: null;
                    $plan_type->save();
                }
            }
        }

        return redirect()->back();

    }


}
