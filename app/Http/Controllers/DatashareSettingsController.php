<?php

namespace App\Http\Controllers;

use App\Models\PhoneNumber;
use App\Models\DataPlan;
use App\Models\PhoneNumberGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DatashareSettingsController extends Controller
{
    /**
     * Display the settings page for user's data share plan settings.
     *
     * @return Response
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Get all data share plans (MTN data share only)
        $dataSharePlans = DataPlan::where('data_plan_category_id', 2) // MTN
            ->with(['category'])
            ->get();

        // Get user's phone number groups
        $userGroups = PhoneNumberGroup::where('user_id', $user->id)
            ->ordered()
            ->get(['id', 'name', 'color', 'description']);

        // Get current settings from user settings JSON column
        $settings = $user->settings ?? [];

        // Initialize settings for each data plan if not already set
        $planSettings = [];
        foreach ($dataSharePlans as $plan) {
            $planId = $plan->id;
            $planSettings[$planId] = $settings['data_share_plans'][$planId] ?? [
                'group_id' => null,
            ];
        }

        return Inertia::render('MtnDatashare/UserSettings', [
            'dataSharePlans' => $dataSharePlans,
            'userGroups' => $userGroups,
            'planSettings' => $planSettings,
            'status' => session('status'),
            'success' => session('success'),
        ]);
    }

    /**
     * Update the user's data share plan settings.
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        $currentSettings = $user->settings ?? [];

        try {
            $validated = $request->validate([
                'planSettings' => 'required|array',
                'planSettings.*.group_id' => 'nullable|integer|exists:phone_number_groups,id',
            ]);

            // Validate that groups belong to the user
            foreach ($validated['planSettings'] as $planId => $setting) {
                if ($setting['group_id']) {
                    $groupExists = PhoneNumberGroup::where('id', $setting['group_id'])
                        ->where('user_id', $user->id)
                        ->exists();

                    if (!$groupExists) {
                        return back()->withErrors(['message' => 'Invalid group selected for one or more plans.']);
                    }
                }
            }

            // Update data share plan settings
            $currentSettings['data_share_plans'] = $validated['planSettings'];

            // Save updated settings
            $user->update(['settings' => $currentSettings]);

            return back()->with('success', 'Data share settings updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update data share settings', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['message' => 'Failed to update settings: ' . $e->getMessage()]);
        }
    }

    /**
     * Get statistics for a specific plan and group combination.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPlanStats(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|integer|exists:data_plans,id',
            'group_id' => 'nullable|integer|exists:phone_number_groups,id',
        ]);

        $user = Auth::user();
        $planId = $request->plan_id;
        $groupId = $request->group_id;

        // Get phone numbers for the specified group (or all if no group)
        $phoneNumbersQuery = PhoneNumber::where('user_id', $user->id)
            ->where('network_id', 1) // MTN only
            ->where('status', 'CONNECTED');

        if ($groupId) {
            $phoneNumbersQuery->where('group_id', $groupId);
        } else {
            $phoneNumbersQuery->whereNull('group_id');
        }

        $phoneNumbers = $phoneNumbersQuery->get();

        $stats = [
            'total_phone_numbers' => $phoneNumbers->count(),
            'connected_phone_numbers' => $phoneNumbers->where('status', 'CONNECTED')->count(),
            'total_data_balance' => $phoneNumbers->sum('data_balance_value'),
            'total_airtime_balance' => $phoneNumbers->sum('airtime_balance_value'),
            'available_for_sharing' => $phoneNumbers->where('enable_datashare', true)->count(),
        ];

        return response()->json($stats);
    }
}
