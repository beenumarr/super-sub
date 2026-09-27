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
     * Display the user's developer dashboard.
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
        $hasApiAccess = $user->hasRole('admin') ||
            $user->hasRole('super-admin') ||
            ($user->package && strtolower($user->package->name) === 'api') ||
            !empty($user->enable_api);

        $apiToken = $hasApiAccess
            ? ($user->original_token ?: 'Click Generate to create your API token')
            : 'Please contact Admin to enable API access';

        return Inertia::render('DeveloperApi/Index', [
            'api_token' => $apiToken,
            'has_api_access' => $hasApiAccess,
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

    public function generateApiToken(Request $request)
    {
        $user = $request->user();

        // Revoke older tokens to ensure clean state
        $user->tokens()->delete();

        // Generate genuine Sanctum Personal Access Token
        $plainToken = $user->createToken('vtu-api')->plainTextToken;

        $user->update([
            'original_token' => $plainToken,
            'api_token' => hash('sha256', $plainToken),
            'api_key' => $plainToken,
        ]);

        return back();
    }
}
