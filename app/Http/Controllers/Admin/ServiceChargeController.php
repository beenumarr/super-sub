<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\CableNetwork;
use Illuminate\Http\Request;
use App\Models\TransactionAddon;
use App\Http\Controllers\Controller;
use App\Models\ElectricityDistributor;

class ServiceChargeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/ServiceCharges/Index', [
            'cable_networks' => CableNetwork::all(),
            'electricity_distributors' => ElectricityDistributor::all(),

        ]);

    }


    public function cableTv(Request $request)
    {

        $charges = $request->service_charges;

        foreach ($charges as $value) {
            $service = TransactionAddon::find($value['id']);

            if ($service) {
                $service->amount = $value['amount'];
                $service->type = $value['type'];
                $service->save();
            }
        }

        return redirect()->back();

    }

    public function billPayment(Request $request)
    {

        $charges = $request->service_charges;

        foreach ($charges as $value) {
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
