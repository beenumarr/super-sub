<?php

namespace App\Http\Controllers\Admin;

use App\Actions\APIs\Kirani\GetBalance;
use App\Http\Controllers\Controller;
use App\Models\AppConfiguration;
use App\Models\DataPlan;
use App\Models\DataPlanType;
use App\Models\MobileNetwork;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SmileController extends Controller
{
    private const SMILE_NETWORK_ID = 6;
    private const SMILE_NETWORK_NAME = 'SMILE';


    /**
     * Display the Smile plans management page.
     */
    public function plans(): Response
    {
        $smileNetwork = MobileNetwork::where('id', self::SMILE_NETWORK_ID)
            ->where('name', self::SMILE_NETWORK_NAME)
            ->first();

        $plans = [];
        $planType = null;

        if ($smileNetwork) {
            // Get the first plan type for Smile network
            $planType = DataPlanType::where('mobile_network_id', $smileNetwork->id)->first();

            if ($planType) {
                $plans = DataPlan::where('data_plan_type_id', $planType->id)
                    ->orderBy('amount')
                    ->get();
            }
        }

        return Inertia::render('Admin/Smile/Plans', [
            'plans' => $plans,
            'plan_type' => $planType,
            'smile_network' => $smileNetwork,
        ]);
    }

    /**
     * Store a new Smile plan.
     */
    public function storePlan(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'size' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'active' => ['boolean'],
        ]);

        $smileNetwork = MobileNetwork::where('id', self::SMILE_NETWORK_ID)
            ->where('name', self::SMILE_NETWORK_NAME)
            ->firstOrFail();

        $planType = DataPlanType::where('mobile_network_id', $smileNetwork->id)->firstOrFail();

        DataPlan::create([
            'data_plan_type_id' => $planType->id,
            'size' => $data['size'],
            'volume' => 'MB',
            'validity' => 'Lifetime',
            'numeric_value' => 1,
            'api_plan_id' => 1,
            'amount' => $data['amount'],
            'active' => $data['active'] ?? true,
        ]);

        return back()->with('success', 'Kirani plan created successfully.');
    }

    /**
     * Update a Kirani plan.
     */
    public function updatePlan(Request $request, DataPlan $plan): RedirectResponse
    {
        $data = $request->validate([
            'size' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'active' => ['boolean'],
        ]);

        $plan->update([
            'size' => $data['size'],
            'amount' => $data['amount'],
            'active' => $data['active'] ?? true,
        ]);

        return back()->with('success', 'Kirani plan updated successfully.');
    }

    /**
     * Delete a Kirani plan.
     */
    public function destroyPlan(DataPlan $plan): RedirectResponse
    {
        $plan->delete();

        return back()->with('success', 'Kirani plan deleted successfully.');
    }
}

