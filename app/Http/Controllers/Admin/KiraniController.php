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

class KiraniController extends Controller
{
    private const KIRANI_NETWORK_ID = 5;
    private const KIRANI_NETWORK_NAME = 'KIRANI';
    public function index(): Response
    {
        $keys = [
            'kirani_username',
            'kirani_password',
            'kirani_api_key',
            'kirani_login_url',
            'kirani_refresh_url',
            'kirani_balance_url',
            'kirani_customer_url',
            'kirani_minutes_url',
        ];

        $configs = AppConfiguration::whereIn('key', $keys)
            ->get(['key', 'value'])
            ->pluck('value', 'key');

        foreach ($configs as $key => $value) {
            if($key === 'kirani_username' || $key === 'kirani_password'){
                $configs[$key] = cs_decrypt($value);
            }
        }

        $balanceResult = (new GetBalance())->handle();

        return Inertia::render('Admin/Kirani/Index', [
            'configs' => $configs,
            'balance' => $balanceResult['balance'] ?? null,
            'balance_status' => $balanceResult['status'] ?? 'failed',
            'balance_message' => $balanceResult['message'] ?? null,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'kirani_username' => ['nullable', 'string'],
            'kirani_password' => ['nullable', 'string'],
            'kirani_api_key' => ['nullable', 'string'],
            'kirani_login_url' => ['nullable', 'string'],
            'kirani_refresh_url' => ['nullable', 'string'],
            'kirani_balance_url' => ['nullable', 'string'],
            'kirani_customer_url' => ['nullable', 'string'],
            'kirani_minutes_url' => ['nullable', 'string'],
        ]);

        foreach ($data as $key => $value) {

            if($key === 'kirani_username' || $key === 'kirani_password'){
                $value = cs_encrypt($value);



                if($key === 'kirani_password'){
                    $value = maskSensitiveData($value);
                }
            }

            AppConfiguration::updateOrCreate(['key' => $key], ['value' => $value]);
            config(["settings.{$key}" => $value]);
        }

        return back()->with('success', 'Kirani configuration updated.');
    }

    public function refreshBalance(): RedirectResponse
    {
        $result = (new GetBalance())->handle();

        return back()->with([
            'balance' => $result['balance'] ?? null,
            'balance_status' => $result['status'] ?? 'failed',
            'balance_message' => $result['message'] ?? null,
        ]);
    }

    /**
     * Display the Kirani plans management page.
     */
    public function plans(): Response
    {
        $kiraniNetwork = MobileNetwork::where('id', self::KIRANI_NETWORK_ID)
            ->where('name', self::KIRANI_NETWORK_NAME)
            ->first();

        $plans = [];
        $planType = null;

        if ($kiraniNetwork) {
            // Get the first plan type for Kirani network
            $planType = DataPlanType::where('mobile_network_id', $kiraniNetwork->id)->first();

            if ($planType) {
                $plans = DataPlan::where('data_plan_type_id', $planType->id)
                    ->orderBy('amount')
                    ->get();
            }
        }

        return Inertia::render('Admin/Kirani/Plans', [
            'plans' => $plans,
            'plan_type' => $planType,
            'kirani_network' => $kiraniNetwork,
        ]);
    }

    /**
     * Store a new Kirani plan.
     */
    public function storePlan(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'size' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'smart_earner_amount' => ['nullable', 'numeric', 'min:0'],
            'affiliate_amount' => ['nullable', 'numeric', 'min:0'],
            'top_user_amount' => ['nullable', 'numeric', 'min:0'],
            'api_amount' => ['nullable', 'numeric', 'min:0'],
            'active' => ['boolean'],
        ]);

        $kiraniNetwork = MobileNetwork::where('id', self::KIRANI_NETWORK_ID)
            ->where('name', self::KIRANI_NETWORK_NAME)
            ->firstOrFail();

        $planType = DataPlanType::where('mobile_network_id', $kiraniNetwork->id)->firstOrFail();

        DataPlan::create([
            'data_plan_type_id' => $planType->id,
            'size' => $data['size'],
            'volume' => 'MB',
            'validity' => 'Lifetime',
            'numeric_value' => 1,
            'api_plan_id' => 1,
            'amount' => $data['amount'],
            'smart_earner_amount' => $data['smart_earner_amount'] ?? $data['amount'],
            'affiliate_amount' => $data['affiliate_amount'] ?? $data['amount'],
            'top_user_amount' => $data['top_user_amount'] ?? $data['amount'],
            'api_amount' => $data['api_amount'] ?? $data['amount'],
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
            'smart_earner_amount' => ['nullable', 'numeric', 'min:0'],
            'affiliate_amount' => ['nullable', 'numeric', 'min:0'],
            'top_user_amount' => ['nullable', 'numeric', 'min:0'],
            'api_amount' => ['nullable', 'numeric', 'min:0'],
            'active' => ['boolean'],
        ]);

        $plan->update([
            'size' => $data['size'],
            'amount' => $data['amount'],
            'smart_earner_amount' => $data['smart_earner_amount'] ?? $data['amount'],
            'affiliate_amount' => $data['affiliate_amount'] ?? $data['amount'],
            'top_user_amount' => $data['top_user_amount'] ?? $data['amount'],
            'api_amount' => $data['api_amount'] ?? $data['amount'],
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

