<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\DataPlanType;
use Illuminate\Http\Request;
use App\Models\FundingMethod;
use App\Models\MobileNetwork;
use App\Http\Controllers\Controller;
use App\Http\Resources\MobileNetworkResource;
use App\Http\Resources\Admin\DataPlanTypeResource;
use App\Models\CableNetwork;
use App\Models\TransactionAddon;

class ServiceDiscountController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/ServiceDiscounts/Index', [
            'mobile_networks' => MobileNetwork::all(),
        ]);

    }


    public function airtime(Request $request)
    {

        $discounts = $request->service_discounts;

        foreach ($discounts as $value) {
            $service = TransactionAddon::find($value['id']);

            if ($service) {
                $service->amount = $value['amount'];
                $service->type = $value['type'];
                $service->save();
            }
        }

        return redirect()->back();

    }
}
