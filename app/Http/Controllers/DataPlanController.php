<?php

namespace App\Http\Controllers;

use App\Http\Resources\DataPlanResource;
use Inertia\Inertia;
use App\Models\DataPlan;
use Illuminate\Http\Request;
use App\Models\DataPlanCategory;
use App\Models\Network;
use Illuminate\Support\Facades\Validator;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class DataPlanController extends Controller
{
    public function index(Request $request): Response
    {
        // Build base query for data plans with ordering
        $dataPlanQuery = DataPlan::where('status', 'ACTIVE')->with(['category.network']);

        // Validate and sanitize network filter
        $networkId = $request->filled('network') ? (int)$request->network : 1;

        // Filter by network
        $dataPlanQuery->whereHas('category', function ($query) use ($networkId) {
            $query->where('network_id', $networkId);
        });

        // Sort by size (converted to MB for proper comparison)
        $dataPlanQuery->orderByRaw("
            CASE
                WHEN volume = 'GB' THEN size * 1024
                WHEN volume = 'TB' THEN size * 1024 * 1024
                ELSE size
            END
        ");

        // Get results
        $dataPlans = $dataPlanQuery->get();

        // Get all categories for the selected network for easier frontend organization
        $categories = DataPlanCategory::where('network_id', $networkId)
            ->where('status', 'ACTIVE')
            ->orderBy('name')
            ->get();

        // Return Inertia view with transformed data
        return Inertia::render('DataPlans/Index', [
            'dataPlans' => DataPlanResource::collection($dataPlans),
            'categories' => $categories,
            'networks' => Network::where('status', 'ACTIVE')->get(),
            'filters' => [
                'network' => (string)$networkId,
            ]
        ]);
    }
}
