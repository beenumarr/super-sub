<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\ExamResource;
use App\Models\ExamType;

class ResultCheckerServicesController extends Controller
{


    public function index()
    {
        return ExamType::all();

    }

    public function show(ExamType $examType)
    {
        return new ExamResource($examType);

    }

    public function update(Request $request)
    {

        $services = $request->services;

        foreach ($services as $value) {
            $service = ExamType::where('name', $value['name'])->first();

            if ($service) {
                $service->active = $value['active'];
                $service->amount = $value['amount'];
                $service->api_id = $value['api_id'];
                $service->transaction_api_id = $value['transaction_api_id'];
                $service->save();
            }
        }

        return redirect()->back();

    }


}
