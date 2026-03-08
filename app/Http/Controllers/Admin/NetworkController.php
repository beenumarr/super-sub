<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gateway;
use App\Models\Network;
use App\Models\DataPlanCategory;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class NetworkController extends Controller
{
    /**
     * Available channels for dispensing
     */
    private const CHANNELS = ['WALLET', 'SIM', 'SMARTCASH_WALLET', 'SMARTCASH_AIRTIME', 'MOMO'];

    /**
     * Display a listing of networks for configuration.
     */
    public function index(Request $request): Response
    {
        // Only admin can access system configuration
        if (!Auth::user()->isAdmin()) {
            return Inertia::render('Errors/Forbidden');
        }

        $networks = Network::orderBy('name')->get();
        $dataPlanCategories = DataPlanCategory::with(['network', 'gateway'])->orderBy('name')->get();
        $gateways = Gateway::orderBy('name')->get();

        // Get selected network (default to first)
        $selectedNetworkId = $request->get('network', $networks->first()?->id);

        return Inertia::render('Admin/Configuration/Index', [
            'networks' => $networks,
            'dataPlanCategories' => $dataPlanCategories,
            'gateways' => $gateways,
            'selectedNetworkId' => (int) $selectedNetworkId,
            'channels' => self::CHANNELS,
        ]);
    }

    /**
     * Update the network status.
     */
    public function updateStatus(Request $request, Network $network): RedirectResponse
    {
        // Only admin can update network status
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $request->validate([
            'status' => ['required', Rule::in(['ACTIVE', 'INACTIVE'])],
        ]);

        $network->update([
            'status' => $request->status
        ]);

        return redirect()->back()->with('success', "Network '{$network->name}' status updated to {$request->status}.");
    }

    /**
     * Update network information.
     */
    public function update(Request $request, Network $network): RedirectResponse
    {
        // Only admin can update network information
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('networks')->ignore($network->id)],
            'description' => ['nullable', 'string', 'max:500'],
            'api_id' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['ACTIVE', 'INACTIVE'])],
        ]);

        $network->update([
            'name' => $request->name,
            'description' => $request->description,
            'api_id' => $request->api_id,
            'status' => $request->status,
        ]);

        return redirect()->back()->with('success', "Network '{$network->name}' updated successfully.");
    }

    /**
     * Update the data plan category status.
     */
    public function updateDataPlanCategoryStatus(Request $request, DataPlanCategory $dataPlanCategory): RedirectResponse
    {
        // Only admin can update data plan category status
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $request->validate([
            'status' => ['required', Rule::in(['ACTIVE', 'INACTIVE'])],
        ]);

        $dataPlanCategory->update([
            'status' => $request->status
        ]);

        return redirect()->back()->with('success', "Data plan category '{$dataPlanCategory->name}' status updated to {$request->status}.");
    }

    /**
     * Update data plan category information.
     */
    public function updateDataPlanCategory(Request $request, DataPlanCategory $dataPlanCategory): RedirectResponse
    {
        // Only admin can update data plan category information
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'type' => ['required', Rule::in(['DIRECT_GIFTING', 'DATA_SHARE', 'AWOOF'])],
            'status' => ['required', Rule::in(['ACTIVE', 'INACTIVE'])],
            'dispense_method' => ['required', Rule::in(['CLOUD', 'DEVICE', 'WALLET'])],
            'service_charge_type' => ['required', Rule::in(['percentage', 'amount', 'default'])],
            'service_charge_amount' => ['nullable', 'numeric', 'min:0'],
            'percentage_caped_amount' => ['nullable', 'numeric', 'min:0'],
            'gateway_id' => ['nullable', 'integer', 'exists:gateways,id'],
        ]);

        $dataPlanCategory->update([
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'status' => $request->status,
            'dispense_method' => $request->dispense_method,
            'service_charge_type' => $request->service_charge_type,
            'service_charge_amount' => $request->filled('service_charge_amount') ? $request->service_charge_amount : null,
            'percentage_caped_amount' => $request->filled('percentage_caped_amount') ? $request->percentage_caped_amount : null,
            'gateway_id' => $request->filled('gateway_id') ? $request->gateway_id : null,
        ]);

        return redirect()->back()->with('success', "Data plan category '{$dataPlanCategory->name}' updated successfully.");
    }

    /**
     * Update channel settings for a category.
     */
    public function updateCategoryChannels(Request $request, DataPlanCategory $dataPlanCategory): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $request->validate([
            'enabled_channels' => ['required', 'array'],
            'active_channel' => ['nullable', Rule::in(self::CHANNELS)],
        ]);

        // Ensure all channels are present in the object
        $channelsObject = [];
        foreach (self::CHANNELS as $channel) {
            $channelsObject[$channel] = $request->enabled_channels[$channel] ?? false;
        }

        $dataPlanCategory->update([
            'enabled_channels' => $channelsObject,
            'active_channel' => $request->active_channel,
        ]);

        return redirect()->back()->with('success', "Channel settings updated for '{$dataPlanCategory->name}'.");
    }

    /**
     * Toggle a specific channel for a category.
     */
    public function toggleCategoryChannel(Request $request, DataPlanCategory $dataPlanCategory): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $request->validate([
            'channel' => ['required', Rule::in(self::CHANNELS)],
        ]);

        $channel = $request->channel;
        $enabledChannels = $dataPlanCategory->enabled_channels ?? [];
        $activeChannel = $dataPlanCategory->active_channel;

        // Clean up old array format - remove numeric indices and convert to object format
        $cleanChannels = [];
        foreach (self::CHANNELS as $ch) {
            // Check if it's in old array format (numeric indices with channel names as values)
            if (is_array($enabledChannels) && in_array($ch, $enabledChannels, true)) {
                $cleanChannels[$ch] = true;
            } elseif (isset($enabledChannels[$ch]) && is_bool($enabledChannels[$ch])) {
                // New object format
                $cleanChannels[$ch] = $enabledChannels[$ch];
            } else {
                $cleanChannels[$ch] = false;
            }
        }

        // Toggle the channel
        $cleanChannels[$channel] = !$cleanChannels[$channel];

        // If active channel is being disabled, clear it
        if ($activeChannel === $channel && !$cleanChannels[$channel]) {
            $activeChannel = null;
        }

        $dataPlanCategory->update([
            'enabled_channels' => $cleanChannels,
            'active_channel' => $activeChannel,
        ]);

        return redirect()->back();
    }

    /**
     * Set the active channel for a category.
     */
    public function setActiveChannel(Request $request, DataPlanCategory $dataPlanCategory): RedirectResponse
    {
        if (!Auth::user()->isAdmin()) {
            abort(403);
        }

        $request->validate([
            'channel' => ['nullable', Rule::in(self::CHANNELS)],
        ]);

        $dataPlanCategory->update([
            'active_channel' => $request->channel,
        ]);

        return redirect()->back();
    }
}
