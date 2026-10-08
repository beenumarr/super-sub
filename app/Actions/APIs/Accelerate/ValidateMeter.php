<?php

namespace App\Actions\APIs\Accelerate;

use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ValidateMeter
{
    public function handle(string $meter_number, string $disco_name, string $meter_type, ?TransactionApi $api = null): array
    {
        $client = new AccelerateClient($api);

        $amount = (float) (request('amount') ?: 1000);

        $resObj = $client->validatePower(
            disco: $disco_name,
            meterNumber: $meter_number,
            meterType: $meter_type,
            amount: $amount
        );

        $httpCode = $resObj['http_code'];
        $res = $resObj['data'];

        if (($httpCode === 200 || $httpCode === 201) && !empty($res)) {
            $data = $res['data'] ?? $res;

            $customerName = $data['name'] 
                ?? $data['customer_name'] 
                ?? $data['Customer_Name'] 
                ?? $data['customerName'] 
                ?? ($res['name'] ?? null);

            $address = $data['address'] 
                ?? $data['Address'] 
                ?? ($res['address'] ?? 'N/A');

            $valRef = $data['validation_reference'] 
                ?? $data['validationReference'] 
                ?? $res['validation_reference'] 
                ?? null;

            if ($valRef) {
                Cache::put('accelerate_power_val_' . trim($meter_number), $valRef, now()->addMinutes(20));
            }

            if (!empty($customerName)) {
                return [
                    'status' => 'success',
                    'name' => $customerName,
                    'address' => $address,
                    'validation_reference' => $valRef,
                ];
            }
        }

        $errorMsg = $res['message'] 
            ?? $res['error'] 
            ?? $res['errors'] 
            ?? 'Meter validation failed. Please check your meter number and disco.';

        if (is_array($errorMsg)) {
            $errorMsg = implode(', ', array_map(fn($e) => is_array($e) ? json_encode($e) : (string)$e, $errorMsg));
        }

        return [
            'status' => 'failed',
            'message' => (string) $errorMsg,
            'name' => (string) $errorMsg,
        ];
    }
}
