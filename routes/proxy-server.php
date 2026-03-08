<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;


Route::post('/oauth/token', function (Request $request) {
    $payload = $request->all();

    $url = $request->header('url');
    try {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, $payload);

        return response()->json($response->json(), $response->status());

    } catch (\Throwable $e) {
        return response()->json(['error' => 'OTP verification failed.'], 500);
    }
});

Route::post('/oauth/token', function (Request $request) {

    $payload =[
        'network' => "1",
        'senderNumber' => $request->input('phone_number'),
    ];

    $url = $request->header('url');
    try {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $request->header('token'),
        ])->post($url, $payload);

        return response()->json($response->json(), $response->status());

    } catch (\Throwable $e) {
        return response()->json(['error' => 'OTP verification failed.'], 500);
    }
});


Route::post('/passwordless/start', function (Request $request) {
    $payload = $request->all();
    $url = $request->header('url');

    Log::warning('Rate limit exceeded for proxy. Delaying request.');

    try {
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, $payload);
        return response()->json($response->json(), $response->status());
    } catch (\Throwable $e) {
        return response()->json(['error' => 'Proxy request failed.'], 500);
    }
});
