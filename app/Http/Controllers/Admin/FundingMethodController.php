<?php

namespace App\Http\Controllers\Admin;

use App\Models\FundingMethod;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class FundingMethodController extends Controller
{


    public function show(FundingMethod $funding_method)
    {
        return $funding_method;

    }

    public function update(Request $request, FundingMethod $funding_method)
    {

        $funding_method->update([
            'active'=> $request->active,
        ]);

        return redirect()->back();

    }


}
