<?php

namespace App\Http\Controllers\Admin;

use App\Models\UserPackage;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PackageController extends Controller
{


    public function index(Request $request)
    {

        return UserPackage::all();

    }

    public function show(UserPackage $userPackage)
    {
        return $userPackage;

    }

    public function update(Request $request)
    {

        $user_packages = $request->user_packages;

        foreach ($user_packages as $package) {
           UserPackage::where('id', $package['id'])->first()
           ->update([
                'daily_spending_limit'=> $package['daily_spending_limit']
            ]);

        }

        return redirect()->back();

    }


}
