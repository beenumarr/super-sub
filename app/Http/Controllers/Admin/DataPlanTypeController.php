<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Ssr\Response;
use App\Models\DataPlanType;
use Illuminate\Http\Request;
use App\Models\MobileNetwork;
use App\Http\Controllers\Controller;
use App\Http\Resources\MobileNetworkResource;
use App\Http\Resources\Admin\DataPlanTypeResource;

class DataPlanTypeController extends Controller
{


    public function index()
    {
        $network = request('network', 1);

        $data = DataPlanType::with('network');


        if ($network) {
            $data->where('mobile_network_id', $network);
        }


        return Inertia::render('Admin/Settings/DataTypes', [
            'data_types' => $data->get(),
            'enable_add_datatype' => config('settings.feat_enable_data_type'),
            'mobile_networks' => MobileNetwork::all(),
        ]);
    }




    public function store(Request $request)
    {


        DataPlanType::create([
            'mobile_network_id'=> $request->mobile_network_id,
            'name'=> $request->name,
            'code'=> $request->name,
            'active' => $request->active,
        ]);


        return redirect()->back();


    }


    public function show(DataPlanType $data_plan_type)
    {
        return new DataPlanTypeResource($data_plan_type);
    }

    public function update(Request $request, DataPlanType $data_plan_type)
    {


        $data_plan_type->update([
            'name'=> $request->name,
            'active'=> $request->active,
        ]);


        // $data_plan->prices()->create([
        //     'package_id'=> 1,
        //     'price'=> 200,
        // ]);


        return redirect()->back();

    }

    public function destroy(DataPlanType $data_plan_type)
    {
        $data_plan_type->delete();

		return response()->json(['success'=>'Deleted']);
    }

}
