<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gateway;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GatewayController extends Controller
{
    /**
     * Display a listing of gateways.
     */
    public function index(): Response
    {
        $gateways = Gateway::orderBy('name')->get()->map(fn (Gateway $g) => [
            'id' => $g->id,
            'name' => $g->name,
            'url' => $g->url,
            'model' => $g->model,
            'service_type' => $g->service_type,
        ]);

        return Inertia::render('Admin/Gateways/Index', [
            'gateways' => $gateways,
            'success' => session('success'),
        ]);
    }

    /**
     * Store a newly created gateway.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('gateways', 'name')],
            'url' => ['required', 'url', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'service_type' => ['nullable', 'string', 'max:255'],
            'token' => ['nullable', 'string', 'max:255'],
            'secret_key' => ['nullable', 'string', 'max:255'],
            'public_key' => ['nullable', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
            'mtn_service_id' => ['nullable', 'integer'],
            'airtel_service_id' => ['nullable', 'integer'],
            'glo_service_id' => ['nullable', 'integer'],
            'ninemobile_service_id' => ['nullable', 'integer'],
            'other_service_id' => ['nullable', 'integer'],
        ]);

        Gateway::create($validated);

        return redirect()->back()->with('success', 'Gateway created successfully.');
    }

    /**
     * Update the specified gateway.
     */
    public function update(Request $request, Gateway $gateway): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('gateways', 'name')->ignore($gateway->id)],
            'url' => ['required', 'url', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'service_type' => ['nullable', 'string', 'max:255'],
            'token' => ['nullable', 'string', 'max:255'],
            'secret_key' => ['nullable', 'string', 'max:255'],
            'public_key' => ['nullable', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
            'mtn_service_id' => ['nullable', 'integer'],
            'airtel_service_id' => ['nullable', 'integer'],
            'glo_service_id' => ['nullable', 'integer'],
            'ninemobile_service_id' => ['nullable', 'integer'],
            'other_service_id' => ['nullable', 'integer'],
        ]);

        $update = [
            'name' => $validated['name'],
            'url' => $validated['url'],
            'model' => $validated['model'],
            'service_type' => $validated['service_type'] ?? null,
        ];
        $optional = ['token', 'secret_key', 'public_key', 'username', 'password', 'mtn_service_id', 'airtel_service_id', 'glo_service_id', 'ninemobile_service_id', 'other_service_id'];
        foreach ($optional as $key) {
            if ($request->filled($key)) {
                $update[$key] = $validated[$key] ?? null;
            }
        }
        $gateway->update($update);

        return redirect()->back()->with('success', 'Gateway updated successfully.');
    }
}

