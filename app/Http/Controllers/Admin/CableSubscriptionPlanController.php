<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\CableNetwork;
use App\Models\TransactionApi;
use App\Http\Controllers\Controller;
use App\Models\CableSubscriptionPlan;
use Illuminate\Support\Facades\Request as FilterRequest;
use App\Http\Requests\Admin\CableSubscriptionPlanRequest;
use App\Http\Resources\Admin\CableSubscriptionPlanResource;

class CableSubscriptionPlanController extends Controller
{
    public function index(): Response
    {
        $pageSize = request('pageSize', 20);
        $currentPage = request('page', 1);


        $data = CableSubscriptionPlan::orderBy('id');

        $data->filter(FilterRequest::only('search', 'trashed', 'network', 'status'));


        return Inertia::render('Admin/Settings/CableSubscriptionPlan', [
            'cable_subscription_plans' => CableSubscriptionPlanResource::collection($data->paginate($pageSize, ['*'], 'page', $currentPage)->appends(FilterRequest::all())),
            'cable_networks' => CableNetwork::all(),
            'apis'=> TransactionApi::all()



        ]);
    }


    public function store(CableSubscriptionPlanRequest $request)
    {


       $plan = CableSubscriptionPlan::create([
            'cable_network_id'=> $request->cable_network_id,
            'package_name'=> $request->package_name,
            'product_code' => $request->product_code,
            'validity' => $request->validity,
            'amount' => $request->amount,
        ]);

        if(config('app.enable_standalone_api')){

            $plan->apis()->createMany($request->api_ids);

        }


        return redirect()->back();


    }


    public function show(CableSubscriptionPlan $cable_subscription_plan)
    {
        return new CableSubscriptionPlanResource($cable_subscription_plan);
    }

    public function update(CableSubscriptionPlanRequest $request, CableSubscriptionPlan $cable_subscription_plan)
    {

        $cable_subscription_plan->update([
            'cable_network_id'=> $request->cable_network_id,
            'package_name'=> $request->package_name,
            'product_code' => $request->product_code,
            'validity' => $request->validity,
            'amount' => $request->amount,
        ]);


        if(config('app.enable_standalone_api')){

            foreach ($request->api_ids as $api_id) {
                $api = $cable_subscription_plan->apis()->where('transaction_api_id', $api_id['transaction_api_id'])->first();

                if($api){

                    $api->update(['product_id'=> $api_id['product_id'],'product_code'=> $api_id['product_code']]);

                }else{

                    $cable_subscription_plan->apis()->create([
                        'transaction_api_id'=> $api_id['transaction_api_id'],
                        'product_id'=> $api_id['product_id'],
                        'product_code'=> $api_id['product_code'],
                    ]);
                }
            }
        }

        return redirect()->back();

    }

    public function destroy(CableSubscriptionPlan $cable_subscription_plan)
    {
        $cable_subscription_plan->forceDelete();

		return response()->json(['success'=>'Deleted']);
    }

}
