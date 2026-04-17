<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Ssr\Response;
use App\Models\DataPlanType;
use Illuminate\Http\Request;
use App\Models\MobileNetwork;
use App\Models\TransactionApi;
use App\Http\Controllers\Controller;
use App\Http\Resources\MobileNetworkResource;
use App\Http\Resources\Admin\DataPlanTypeResource;

class DataPlanTypeController extends Controller
{


    public function index()
    {
        $network = request('network', 1);

        $data = DataPlanType::with('network', 'api');


        if ($network) {
            $data->where('mobile_network_id', $network);
        }


        return Inertia::render('Admin/Settings/DataTypes', [
            'data_types' => $data->get(),
            'enable_add_datatype' => config('settings.feat_enable_data_type'),
            'mobile_networks' => MobileNetwork::all(),
            'apis' => TransactionApi::all(['id', 'name']),
        ]);
    }




    public function store(Request $request)
    {

        $validated = $request->validate([
            'mobile_network_id' => ['required', 'integer', 'exists:mobile_networks,id'],
            'transaction_api_id' => ['required', 'integer', 'exists:transaction_apis,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255'],
            'active' => ['required'],
        ]);

        DataPlanType::create([
            'mobile_network_id'=> $validated['mobile_network_id'],
            'transaction_api_id'=> $validated['transaction_api_id'],
            'name'=> $validated['name'],
            'code'=> $validated['code'],
            'active' => $validated['active'],
        ]);


        return redirect()->back();


    }


    public function show(DataPlanType $data_plan_type)
    {
        return new DataPlanTypeResource($data_plan_type);
    }

    public function update(Request $request, DataPlanType $data_plan_type)
    {

        $validated = $request->validate([
            'mobile_network_id' => ['required', 'integer', 'exists:mobile_networks,id'],
            'transaction_api_id' => ['required', 'integer', 'exists:transaction_apis,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255'],
            'active' => ['required'],
        ]);

        $data_plan_type->update([
            'mobile_network_id'=> $validated['mobile_network_id'],
            'transaction_api_id'=> $validated['transaction_api_id'],
            'name'=> $validated['name'],
            'code'=> $validated['code'],
            'active'=> $validated['active'],
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

    /**
     * Toggle active status for the data plan type.
     */
    public function toggle(DataPlanType $data_plan_type)
    {
        $data_plan_type->active = !$data_plan_type->active;
        $data_plan_type->save();

        return response()->json(['active' => $data_plan_type->active]);
    }

}
