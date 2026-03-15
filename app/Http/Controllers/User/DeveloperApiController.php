<?php

namespace App\Http\Controllers\User;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\CableNetwork;
use App\Models\CableSubscriptionPlan;
use App\Models\DataPlan;
use App\Models\DataPlanType;
use App\Models\ElectricityDistributor;
use App\Models\MobileNetwork;

class DeveloperApiController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function index(): Response
    {
        // Get standard mobile networks (exclude KIRANI and SMILE)
        $standardNetworks = MobileNetwork::whereNotIn('name', ['KIRANI', 'SMILE'])->get(['name', 'id']);

        // Get data plans grouped by network (exclude KIRANI and SMILE)
        $data_plans = DataPlanType::with('dataPlans', 'network')
            ->whereHas('network', function ($query) {
                $query->whereNotIn('name', ['KIRANI', 'SMILE']);
            })
            ->get()
            ->groupBy('network.name');

        // Get Kirani plans
        $kirani_plans = DataPlan::whereHas('planType.network', function ($query) {
            $query->where('name', 'KIRANI');
        })->where('active', 1)->orderBy('amount')->get();

        // Get Smile plans
        $smile_plans = DataPlan::whereHas('planType.network', function ($query) {
            $query->where('name', 'LIKE', '%SMILE%');
        })->where('active', 1)->orderBy('amount')->get();

        // Get cable plans grouped by provider
        $cable_plans = CableSubscriptionPlan::with('cableProvider')->get()
            ->groupBy('cableProvider.name');

        $user = auth()->user();

        return Inertia::render('DeveloperApi/Index', [
            'api_token' => $user->package->name === 'Api' ? $user->original_token : "Please contact Admin to enable API access",
            'data_plans' => $data_plans,
            'kirani_plans' => $kirani_plans,
            'smile_plans' => $smile_plans,
            'cable_plans' => $cable_plans,
            'mobile_networks' => $standardNetworks,
            'cable_networks' => CableNetwork::get(['name', 'id']),
            'disco_list' => ElectricityDistributor::get(['name', 'id', 'active']),
        ]);
    }


    public function docs(): Response
    {
        return Inertia::render('DeveloperApi/Documentation');
    }



    function generateApiToken(Request $request) {

        $user = $request->user();

        $strToken = Str::random(40);

        $token = hash('sha256', $strToken);

        $user->update(['api_token'=> $token, 'original_token'=> $strToken]);

        return back();

    }







}
