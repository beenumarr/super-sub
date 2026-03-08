<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\DataPlan;
use App\Models\ServiceCard;
use App\Models\MobileNetwork;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DataPlanRequest;
use App\Http\Requests\Admin\ServiceCardRequest;
use App\Http\Resources\MobileNetworkResource;
use App\Http\Resources\Admin\DataPlanResource;
use App\Http\Resources\Admin\ServiceCardResource;
use Illuminate\Support\Facades\Request as FilterRequest;

class ServiceCardController extends Controller
{
    public function index(): Response
    {
        $pageSize = request('pageSize', 20);
        $currentPage = request('page', 1);


        $data = ServiceCard::orderBy('id');

        $data->filter(FilterRequest::only('search', 'trashed', 'mobile_network_id', 'data_plan_type_id', 'status'));

        return Inertia::render('Admin/ServiceCards/Index', [
            'data' => ServiceCardResource::collection($data->paginate($pageSize, ['*'], 'page', $currentPage)->appends(FilterRequest::all())),
            'mobile_networks' => MobileNetworkResource::collection(MobileNetwork::all()),
            'data_plans' => DataPlanResource::collection(DataPlan::all()),
        ]);
    }


    public function store(ServiceCardRequest $request)
    {

        // dd($request->all());

        for ($i=0; $i < $request->quantity; $i++) {

            ServiceCard::create([
                'mobile_network_id'=> $request->mobile_network_id,
                'data_plan_id'=> $request->mobile_network_id,
                'value'=> 100,
                'serial'=>'0001292'+$i,
                'pin'=>'0001292'+$i,
            ]);

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
        ]);


        // $data_plan->prices()->create([
        //     'package_id'=> 1,
        //     'price'=> 200,
        // ]);


        return redirect()->back();

    }

    public function destroy(DataPlan $data_plan)
    {
        $data_plan->forceDelete();

		return response()->json(['success'=>'Deleted']);
    }

}
