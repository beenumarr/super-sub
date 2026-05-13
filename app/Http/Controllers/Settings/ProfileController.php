<?php

namespace App\Http\Controllers\Settings;

use Throwable;
use App\Models\User;
use App\Models\DataPlan;
use App\Models\DataPlanCategory;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Http\Requests\Settings\ProfileUpdateRequest;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }


    public function apiKey(Request $request)
    {
        $user = $request->user();
        $token = null;

        if ($user->original_token) {
            $token = $user->original_token;
        } elseif ($user->api_token) {
            try {
                $token = decrypt($user->api_token);
            } catch (Throwable) {
                $token = $user->api_token;
            }
        }

        return Inertia::render('developer/api-key', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'token' => $token,
        ]);
    }



    public function developer(Request $request): Response
    {
        return Inertia::render('developer/Index', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),

        ]);
    }
    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }


    public function generateApiKey(Request $request)
    {
        $user = $request->user();

        // Revoke old tokens first
        $user->tokens()->delete();

        // Create a new token
        $token = $user->createToken('default');

        // Store encrypted token in user table
        $user->update([
            'api_token' => hash('sha256', $token->plainTextToken),
            'original_token' => $token->plainTextToken,
        ]);

        return back();
    }

    /**
     * Show the webhook settings page.
     */
    public function webhook(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('developer/webhook', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'webhookUrl' => $user->webhook_url,
        ]);
    }

    /**
     * Update the webhook URL.
     */
    public function updateWebhook(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'webhook_url' => ['nullable', 'url', 'max:255'],
        ]);

        $request->user()->update([
            'webhook_url' => $validated['webhook_url'],
        ]);

        return back();
    }


    /**
     * Calculate default charge for a category.
     */
    private function calculateCategoryDefaultCharge(DataPlanCategory $category): float
    {
        $serviceChargeType = $category->service_charge_type ?? 'default';
        $serviceChargeAmount = $category->service_charge_amount ?? null;
        $percentageCapedAmount = $category->percentage_caped_amount ?? null;

        // If default, use config fallback
        if ($serviceChargeType === 'default') {
            $categoryType = $category->type ?? 'DATA_SHARE';
            return $categoryType === 'DIRECT_GIFTING'
                ? config('app.dg_service_fee', 0)
                : config('app.service_fee', 0);
        }

        // For percentage type, we need a base amount - use average telco price or config
        if ($serviceChargeType === 'percentage') {
            $baseAmount = config('app.avg_telco_price', 1000); // Default average
            $charge = ($baseAmount * $serviceChargeAmount) / 100;
            // Apply cap if set
            if ($percentageCapedAmount !== null && $charge > $percentageCapedAmount) {
                $charge = $percentageCapedAmount;
            }
            return $charge;
        } elseif ($serviceChargeType === 'amount') {
            return $serviceChargeAmount ?? 0;
        }

        // Fallback to config
        $categoryType = $category->type ?? 'DATA_SHARE';
        return $categoryType === 'DIRECT_GIFTING'
            ? config('app.dg_service_fee', 0)
            : config('app.service_fee', 0);
    }

    /**
     * Calculate default charge for a plan.
     */
    private function calculatePlanDefaultCharge(DataPlan $plan): float
    {
        $serviceChargeType = $plan->service_charge_type ?? 'default';
        $serviceChargeAmount = $plan->service_charge_amount ?? null;
        $percentageCapedAmount = $plan->percentage_caped_amount ?? null;

        // If plan service charge type is 'default', inherit from category
        if ($serviceChargeType === 'default') {
            $category = $plan->category;
            if ($category) {
                return $this->calculateCategoryDefaultCharge($category);
            }
        }

        // Calculate charge based on type
        if ($serviceChargeType === 'percentage') {
            $baseAmount = $plan->telco_price ?? config('app.avg_telco_price', 1000);
            $charge = ($baseAmount * $serviceChargeAmount) / 100;
            // Apply cap if set
            if ($percentageCapedAmount !== null && $charge > $percentageCapedAmount) {
                $charge = $percentageCapedAmount;
            }
            return $charge;
        } elseif ($serviceChargeType === 'amount') {
            return $serviceChargeAmount ?? 0;
        }

        // Fallback to category or config
        $category = $plan->category;
        if ($category) {
            return $this->calculateCategoryDefaultCharge($category);
        }

        return config('app.service_fee', 0);
    }

    /**
     * Show the user's transaction charges.
     */
    public function charges(Request $request): Response
    {
        $user = $request->user();
        $userConfig = $user->user_config ?? [];
        $customChargeEnabled = $userConfig['custom_charge'] ?? false;

        $categoryCharges = [];
        $planCharges = [];

        if ($customChargeEnabled) {
            // Get custom category charges with category details
            if (isset($userConfig['categories']) && is_array($userConfig['categories'])) {
                $categoryIds = array_keys($userConfig['categories']);
                $categories = DataPlanCategory::with('network:id,name')
                    ->whereIn('id', $categoryIds)
                    ->get(['id', 'name', 'network_id', 'type', 'service_charge_type', 'service_charge_amount', 'percentage_caped_amount']);

                foreach ($categories as $category) {
                    $categoryCharges[] = [
                        'id' => $category->id,
                        'name' => $category->name,
                        'network' => $category->network->name ?? 'Unknown',
                        'charge' => $userConfig['categories'][$category->id],
                    ];
                }
            }

            // Get custom plan charges with plan details
            if (isset($userConfig['plans']) && is_array($userConfig['plans'])) {
                $planIds = array_keys($userConfig['plans']);
                $plans = DataPlan::with('category.network:id,name')
                    ->whereIn('id', $planIds)
                    ->get(['id', 'name', 'size', 'volume', 'data_plan_category_id', 'telco_price', 'service_charge_type', 'service_charge_amount', 'percentage_caped_amount']);

                foreach ($plans as $plan) {
                    $planCharges[] = [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'size' => $plan->size,
                        'volume' => $plan->volume,
                        'category' => $plan->category->name ?? 'Unknown',
                        'network' => $plan->category->network->name ?? 'Unknown',
                        'charge' => $userConfig['plans'][$plan->id],
                    ];
                }
            }
        } else {
            // Show default charges for all active categories, but override with custom charges if they exist
            $categories = DataPlanCategory::with('network:id,name')
                ->where('status', 'ACTIVE')
                ->get();

            foreach ($categories as $category) {
                // Check if user has custom charge for this category, even if custom_charge is disabled
                $charge = $this->calculateCategoryDefaultCharge($category);
                if (isset($userConfig['categories']) && is_array($userConfig['categories']) && isset($userConfig['categories'][$category->id])) {
                    $charge = $userConfig['categories'][$category->id];
                }

                $categoryCharges[] = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'network' => $category->network->name ?? 'Unknown',
                    'charge' => $charge,
                ];
            }

            // Only show plans that exist in custom config (even if custom_charge is disabled)
            if (isset($userConfig['plans']) && is_array($userConfig['plans']) && count($userConfig['plans']) > 0) {
                $planIds = array_keys($userConfig['plans']);
                $plans = DataPlan::with(['category.network:id,name', 'category'])
                    ->whereIn('id', $planIds)
                    ->get();

                foreach ($plans as $plan) {
                    // Use custom charge if it exists, otherwise use default
                    $charge = $this->calculatePlanDefaultCharge($plan);
                    if (isset($userConfig['plans'][$plan->id])) {
                        $charge = $userConfig['plans'][$plan->id];
                    }

                    $planCharges[] = [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'size' => $plan->size,
                        'volume' => $plan->volume,
                        'category' => $plan->category->name ?? 'Unknown',
                        'network' => $plan->category->network->name ?? 'Unknown',
                        'charge' => $charge,
                    ];
                }
            }
        }

        return Inertia::render('settings/charges', [
            'categoryCharges' => $categoryCharges,
            'planCharges' => $planCharges,
        ]);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
