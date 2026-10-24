<?php

namespace App\Actions\APIs\Accelerate;

use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ValidateICU
{
    public function handle(string $smart_card_number, string $cable_name, ?TransactionApi $api = null): array
    {
        $client = new AccelerateClient($api);

        $resObj = $client->validateTv(
            provider: $cable_name,
            smartCardNumber: $smart_card_number
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

            $valRef = $data['validation_reference'] 
                ?? $data['validationReference'] 
                ?? $res['validation_reference'] 
                ?? null;

            if ($valRef) {
                Cache::put('accelerate_tv_val_' . trim($smart_card_number), $valRef, now()->addMinutes(20));
            }

            if (!empty($customerName)) {
                return [
                    'status' => 'success',
                    'name' => $customerName,
                    'validation_reference' => $valRef,
                ];
            }
        }

        $errorMsg = $res['message'] 
            ?? $res['error'] 
            ?? $res['errors'] 
            ?? 'Smartcard validation failed. Please check the number and provider.';

        if (is_array($errorMsg)) {
            $errorMsg = implode(', ', array_map(fn($e) => is_array($e) ? json_encode($e) : (string)$e, $errorMsg));
        }

        return [
            'status' => 'failed',
            'name' => (string) $errorMsg,
        ];
    }
}
