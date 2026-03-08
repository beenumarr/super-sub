<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Network;
use App\Models\DataPlan;

class ApiDocumentationController extends Controller
{
    public function index()
    {
        $networks = Network::all();
        $sampleDataPlans = DataPlan::with('category.network')
            ->where('status', 'ACTIVE')
            ->limit(5)
            ->get();

        return Inertia::render('ApiDocumentation', [
            'networks' => $networks,
            'sampleDataPlans' => $sampleDataPlans,
        ]);
    }
}
