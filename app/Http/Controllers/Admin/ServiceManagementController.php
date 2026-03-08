<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\DataPlanType;
use App\Models\FundingMethod;
use App\Models\MobileNetwork;
use App\Models\TransactionApi;
use App\Http\Controllers\Controller;
use App\Http\Resources\MobileNetworkResource;
use App\Http\Resources\Admin\DataPlanTypeResource;

class ServiceManagementController extends Controller
{
    public function index(): Response
    {
        $data = DataPlanType::all();

        return Inertia::render('Admin/ServicesManagement/Index', [
            'data_plan_types' => DataPlanTypeResource::collection($data),
            'mobile_networks' => MobileNetworkResource::collection(MobileNetwork::all()),
            'apis'=> TransactionApi::all(),
            'can_add_api'=> config('settings.feat_enable_add_api') === "1",
            'electricicty_bill_transaction_api_id'=> config('settings.electricicty_bill_transaction_api_id')
        ]);

    }
}
