<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Models\TransactionApi;
use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionApiResource;

class TransactionApiController extends Controller
{


    public function show(TransactionApi $transactionApi)
    {
        return new TransactionApiResource($transactionApi);

    }

    public function update(Request $request, TransactionApi $transactionApi)
    {
        $request->validate([
            'name'=> "required|string|unique:transaction_apis,name,$transactionApi->id,id",
            'url'=>'required|url',
        ]);

        $updateData = [
            'name'=> $request->name,
            'url'=> $request->url,
            'mtn_service_id'=> $request->mtn_service_id,
            'airtel_service_id'=> $request->airtel_service_id,
            'glo_service_id'=> $request->glo_service_id,
            'ninemobile_service_id'=> $request->ninemobile_service_id,
        ];

        // Only update sensitive fields if they're provided and not masked
        if ($request->filled('token') && !str_contains($request->token, '*')) {
            $updateData['token'] = $request->token;
        }
        if ($request->filled('username') && !str_contains($request->username, '*')) {
            $updateData['username'] = $request->username;
        }
        if ($request->filled('password') && !str_contains($request->password, '*')) {
            $updateData['password'] = $request->password;
        }
        if ($request->filled('secret_key') && !str_contains($request->secret_key, '*')) {
            $updateData['secret_key'] = $request->secret_key;
        }
        if ($request->filled('public_key') && !str_contains($request->public_key, '*')) {
            $updateData['public_key'] = $request->public_key;
        }

        $transactionApi->update($updateData);

        return redirect()->back();
    }



    public function store(Request $request)
    {
        $request->validate([
            'name'=> "required|string|unique:transaction_apis,name",
            'url'=>'required|url',
        ]);

        TransactionApi::create([
            'name'=> $request->name,
            'url'=> $request->url,
            'token'=> $request->token,
            'secret_key'=> $request->secret_key,
            'public_key'=> $request->public_key,
            'username'=> $request->username,
            'password'=> $request->password,
            'model'=> $request->model,
        ]);

        return redirect()->back();
    }


}
