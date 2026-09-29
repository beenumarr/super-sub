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

        if (config('app.enable_standalone_api') && is_array($request->api_ids)) {
            $validApis = collect($request->api_ids)->filter(function ($apiItem) {
                if (empty($apiItem['transaction_api_id'])) {
                    return false;
                }
                $hasProductId = isset($apiItem['product_id']) && trim((string) $apiItem['product_id']) !== '';
                $hasProductCode = isset($apiItem['product_code']) && trim((string) $apiItem['product_code']) !== '';
                return $hasProductId || $hasProductCode;
            })->map(function ($apiItem) use ($plan) {
                $code = !empty($apiItem['product_code']) ? (string) $apiItem['product_code'] : (!empty($apiItem['product_id']) ? (string) $apiItem['product_id'] : (string) $plan->product_code);
                $prodId = isset($apiItem['product_id']) && is_numeric($apiItem['product_id'])
                    ? (int) $apiItem['product_id']
                    : (is_numeric($code) ? (int) $code : (is_numeric($plan->product_code) ? (int) $plan->product_code : null));

                return [
                    'transaction_api_id' => $apiItem['transaction_api_id'],
                    'product_id' => $prodId,
                    'product_code' => $code,
                ];
            })->values()->all();

            if (!empty($validApis)) {
                $plan->apis()->createMany($validApis);
            }
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
            'cable_network_id' => $request->cable_network_id,
            'package_name' => $request->package_name,
            'product_code' => $request->product_code,
            'validity' => $request->validity,
            'amount' => $request->amount,
        ]);

        if (config('app.enable_standalone_api') && is_array($request->api_ids)) {
            foreach ($request->api_ids as $api_id) {
                if (empty($api_id['transaction_api_id'])) {
                    continue;
                }

                $hasProductId = isset($api_id['product_id']) && trim((string) $api_id['product_id']) !== '';
                $hasProductCode = isset($api_id['product_code']) && trim((string) $api_id['product_code']) !== '';

                $api = $cable_subscription_plan->apis()->where('transaction_api_id', $api_id['transaction_api_id'])->first();

                if (!$hasProductId && !$hasProductCode) {
                    if ($api) {
                        $api->delete();
                    }
                    continue;
                }

                $code = !empty($api_id['product_code']) ? (string) $api_id['product_code'] : (!empty($api_id['product_id']) ? (string) $api_id['product_id'] : (string) $cable_subscription_plan->product_code);
                $prodId = isset($api_id['product_id']) && is_numeric($api_id['product_id'])
                    ? (int) $api_id['product_id']
                    : (is_numeric($code) ? (int) $code : (is_numeric($cable_subscription_plan->product_code) ? (int) $cable_subscription_plan->product_code : null));

                if ($api) {
                    $api->update([
                        'product_id' => $prodId,
                        'product_code' => $code,
                    ]);
                } else {
                    $cable_subscription_plan->apis()->create([
                        'transaction_api_id' => $api_id['transaction_api_id'],
                        'product_id' => $prodId,
                        'product_code' => $code,
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
