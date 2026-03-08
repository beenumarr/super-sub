<?php

namespace App\Http\Controllers;

use App\Models\Network;
use App\Models\PhoneNumber;
use App\Models\DataPlanCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserSettingsController extends Controller
{
    /**
     * Display the settings page for user's category-specific dispense method settings.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request, $type)
    {
        // Get the current user
        $user = Auth::user();

        if(!$type || !in_array($type, ['mtn-data-share', 'mtn-direct-gifting', 'airtel-direct-gifting', 'mtn-momo-psb'])){
            return redirect()->route('dashboard')->with('error', 'Invalid request');
        }

        if($type == 'mtn-data-share'){

            $cat = DataPlanCategory::with('network:id,name')->where('network_id', 1)->where('name', 'Data Share')
            ->first();

            $phoneNumbers = PhoneNumber::where('network_id', 1)->where('user_id', $user->id)->where('plan_type_purchased', 'Data Share')
            ->with('network')
            ->get();

        }else if($type == 'mtn-direct-gifting'){

            $cat = DataPlanCategory::with('network:id,name')->where('network_id', 1)->where('name', 'Direct Gifting')
            ->first();

            $phoneNumbers = PhoneNumber::where('network_id', 1)->where('user_id', $user->id)->whereIn('plan_type_purchased', ['Direct Gifting', 'Momo App'])
            ->with('network')
            ->get();

         }else if($type == 'airtel-direct-gifting'){

            $cat = DataPlanCategory::with('network:id,name')->where('network_id', 2)->where('name', 'Direct Gifting')
            ->first();

                $phoneNumbers = PhoneNumber::where('network_id', 2)->where('user_id', $user->id)
                ->with('network')
                ->get();
         }else if($type == 'mtn-momo-psb'){

            $cat = DataPlanCategory::with('network:id,name')->where('network_id', 1)->where('name', 'Momo App')
            ->first();

            $phoneNumbers = PhoneNumber::where('network_id', 1)->where('user_id', $user->id)->where('plan_type_purchased', 'Momo App')
            ->with('network')
            ->get();
         }

        // Get user's connected phone numbers



        // Get current settings from user settings JSON column
        $settings = $user->settings ?? [];

        $categories = DataPlanCategory::all();

        // Initialize settings for each category if not already set
        $categorySettings = [];
        foreach ($categories as $category) {
            $categoryId = $category->id;
            $setting = $settings[$categoryId] ?? [
                'dispense_method' => 'SIM',
                'status' => 'ACTIVE',
                'phone_number_id' => null,
            ];

            // Migrate old dispense method values to new ones
            if (isset($setting['dispense_method'])) {
                $oldMethod = $setting['dispense_method'];
                if ($oldMethod === 'CLOUD' || $oldMethod === 'DEVICE') {
                    $setting['dispense_method'] = 'SIM';
                }
            }

            $categorySettings[$categoryId] = $setting;
        }

        // Build dispense method options based on type
        $dispenseMethodOptions = [
            'WALLET' => 'Wallet Balance',
            'SIM' => 'SIM Card',
        ];

        // Add SMARTCASH options only for Airtel Direct Gifting
        if ($type === 'airtel-direct-gifting') {
            $dispenseMethodOptions['SMARTCASH_AIRTIME'] = 'SIM Channel 2 (Smartcash: Sim Airtime)';
            $dispenseMethodOptions['SMARTCASH_WALLET'] = 'Smart Cash (Wallet)';
        }

        // Add MOMO option only for MTN networks
        if ($type === 'mtn-data-share' || $type === 'mtn-direct-gifting') {
            $dispenseMethodOptions['MOMO'] = 'MTN Momo';
        }

        // Get data plans for this category (for individual plan settings)
        $dataPlans = \App\Models\DataPlan::where('data_plan_category_id', $cat->id)
            ->where('status', 'ACTIVE')
            ->orderByRaw("
                CASE
                    WHEN volume = 'GB' THEN size * 1024
                    WHEN volume = 'TB' THEN size * 1024 * 1024
                    ELSE size
                END
            ")
            ->get();

        // Get plan settings from category settings
        $currentCategorySettings = $settings[$cat->id] ?? [];
        $planSettings = $currentCategorySettings['plans'] ?? [];
        foreach ($dataPlans as $plan) {
            if (!isset($planSettings[$plan->id])) {
                $planSettings[$plan->id] = ['dispense_method' => 'DEFAULT'];
            }
        }

        // Build plan dispense method options (includes DEFAULT)
        $planDispenseMethodOptions = [
            'DEFAULT' => 'Default',
            'WALLET' => 'Wallet Balance',
            'SIM' => 'SIM Card',
        ];

        if ($type === 'airtel-direct-gifting') {
            $planDispenseMethodOptions['SMARTCASH_AIRTIME'] = 'SIM Channel 2 (Smartcash: Sim Airtime)';
            $planDispenseMethodOptions['SMARTCASH_WALLET'] = 'Smart Cash (Wallet)';
        }

        if ($type === 'mtn-data-share' || $type === 'mtn-direct-gifting') {
            $planDispenseMethodOptions['MOMO'] = 'MTN Momo';
        }

        return Inertia::render('settings/UserSettings', [
            'categorySettings' => $categorySettings,
            'phoneNumbers' => $phoneNumbers,
            'status' => session('status'),
            'dispenseMethodOptions' => $dispenseMethodOptions,
            'planDispenseMethodOptions' => $planDispenseMethodOptions,
            'category' => $cat,
            'type' => $type,
            'dataPlans' => $dataPlans,
            'planSettings' => $planSettings,
        ]);
    }

    /**
     * Update the user's category-specific dispense method settings.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        $currentSettings = $user->settings ?? [];

        try {
            // First, migrate any old values in the request
            $requestData = $request->all();
            if (isset($requestData['settings']) && is_array($requestData['settings'])) {
                foreach ($requestData['settings'] as $categoryId => $setting) {
                    if (isset($setting['dispense_method'])) {
                        $oldMethod = $setting['dispense_method'];
                        if ($oldMethod === 'CLOUD' || $oldMethod === 'DEVICE') {
                            $requestData['settings'][$categoryId]['dispense_method'] = 'SIM';
                        }
                    }
                }
                $request->merge($requestData);
            }

            $updatedSettings = $request->validate([
                'settings' => 'required|array',
                'settings.*.dispense_method' => 'required|in:WALLET,SIM,SMARTCASH_AIRTIME,SMARTCASH_WALLET,MOMO',
                'settings.*.status' => 'required|in:ACTIVE,INACTIVE',
                'settings.*.phone_number_id' => 'nullable',
            ]);


            // Process each category's settings
            foreach ($updatedSettings['settings'] as $categoryId => $setting) {

                // Preserve existing plan settings when updating category settings
                $existingPlans = $currentSettings[$categoryId]['plans'] ?? [];

                $currentSettings[$categoryId] = array_merge($setting, [
                    'plans' => $existingPlans
                ]);

            }




            // Save all updated settings
            $user->update([
                'settings'=> $currentSettings
            ]) ;



            return back()->with('success', 'Settings updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update user settings', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['message' => 'Failed to update settings: ' . $e->getMessage()]);
        }
    }

    /**
     * Update a single plan's dispense method setting.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updatePlanSetting(Request $request)
    {
        $user = Auth::user();

        try {
            $validated = $request->validate([
                'category_id' => 'required|integer|exists:data_plan_categories,id',
                'plan_id' => 'required|integer|exists:data_plans,id',
                'dispense_method' => 'required|in:DEFAULT,WALLET,SIM,SMARTCASH_AIRTIME,SMARTCASH_WALLET,MOMO',
            ]);

            $currentSettings = $user->settings ?? [];
            $categoryId = $validated['category_id'];
            $planId = $validated['plan_id'];

            // Initialize category settings if not exists
            if (!isset($currentSettings[$categoryId])) {
                $currentSettings[$categoryId] = [
                    'dispense_method' => 'WALLET',
                    'status' => 'ACTIVE',
                    'phone_number_id' => null,
                    'plans' => []
                ];
            }

            // Initialize plans array if not exists
            if (!isset($currentSettings[$categoryId]['plans'])) {
                $currentSettings[$categoryId]['plans'] = [];
            }

            // Update the specific plan's dispense method
            $currentSettings[$categoryId]['plans'][$planId] = [
                'dispense_method' => $validated['dispense_method']
            ];

            // Save the settings
            $user->update(['settings' => $currentSettings]);

            return back();

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Failed to update plan setting', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors([
                'dispense_method' => 'Failed to update setting: ' . $e->getMessage()
            ]);
        }
    }
}
