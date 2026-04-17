<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\DataPlan;
use App\Models\DataPlanType;
use App\Models\MobileNetwork;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DataPlanRequest;
use App\Http\Resources\MobileNetworkResource;
use App\Http\Resources\Admin\DataPlanResource;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Request as FilterRequest;

class DataPlanController extends Controller
{
    public function index(): Response
    {
        $pageSize = request('pageSize', 20);
        $currentPage = request('page', 1);
        $network = request('network');


        $data = DataPlan::with('planType.network', 'apis')->latest();

        $data->filter(FilterRequest::only('search', 'trashed', 'network', 'planType', 'status'));

        $dataTypes = DataPlanType::with('network', 'api')->latest();
        if (!empty($network)) {
            $dataTypes->where('mobile_network_id', $network);
        }

        return Inertia::render('Admin/Settings/DataPlans', [
            'data_plans' => DataPlanResource::collection($data->paginate($pageSize, ['*'], 'page', $currentPage)->appends(FilterRequest::all())),
            'mobile_networks' => MobileNetworkResource::collection(MobileNetwork::with('addon.package')->whereNotIn('name', ['KIRANI'])->get()),
            'apis'=> TransactionApi::all(['id', 'name']),
            'data_types' => $dataTypes->get(),
            'enable_add_datatype' => config('settings.feat_enable_data_type'),
            'active_tab' => request('tab', 'plans'),


        ]);
    }


    public function store(DataPlanRequest $request)
    {

       $plan = DataPlan::create([
            'data_plan_type_id'=> $request->data_plan_type_id,
            'size'=> $request->plan_size??0,
            'api_plan_id' => $request->api_plan_id,
            'volume' => $request->plan_volume?? 'GB',
            'validity' => $request->plan_validity??0,
            'numeric_value' => 1000,
            'amount' => $request->amount,
            'smart_earner_amount' => $request->smart_earner_amount,
            'affiliate_amount' => $request->affiliate_amount,
            'top_user_amount' => $request->top_user_amount,
            'api_amount' => $request->api_amount,
            'enable_custom_vending_api' => $request->enable_custom_vending_api,
            'custom_api_vending_id' => $request->custom_api_vending_id,
            'active' => $request->active,
            'name' => $request->name,

        ]);

        if(config('app.enable_standalone_api')){

            $plan->apis()->createMany($request->api_ids);

        }


        return redirect()->back();


    }


    public function show(DataPlan $data_plan)
    {
        return new DataPlanResource($data_plan);
    }

    public function update(DataPlanRequest $request, DataPlan $data_plan)
    {

        $data_plan->update([
            'data_plan_type_id'=> $request->data_plan_type_id,
            'size'=> $request->plan_size,
            'api_plan_id' => $request->api_plan_id,
            'volume' => $request->plan_volume,
            'validity' => $request->plan_validity,
            'numeric_value' => 1000,
            'amount' => $request->amount,
            'smart_earner_amount' => $request->smart_earner_amount,
            'affiliate_amount' => $request->affiliate_amount,
            'top_user_amount' => $request->top_user_amount,
            'api_amount' => $request->api_amount,
            'enable_custom_vending_api' => $request->enable_custom_vending_api,
            'custom_api_vending_id' => $request->custom_api_vending_id,
            'active' => $request->active,
            'name' => $request->name,
        ]);

        if(config('app.enable_standalone_api')){

            foreach ($request->api_ids as $api_id) {
                $api = $data_plan->apis()->where('transaction_api_id', $api_id['transaction_api_id'])->first();

                if($api){

                    $api->update(['product_id'=> $api_id['product_id'],'product_code'=> $api_id['product_code']]);

                }else{

                    $data_plan->apis()->create([
                        'transaction_api_id'=> $api_id['transaction_api_id'],
                        'product_id'=> $api_id['product_id'],
                        'product_code'=> $api_id['product_code'],
                    ]);
                }
            }
        }


        return redirect()->back();

    }

    public function destroy(DataPlan $data_plan)
    {
        $data_plan->delete();

		return response()->json(['success'=>'Deleted']);
    }

}
