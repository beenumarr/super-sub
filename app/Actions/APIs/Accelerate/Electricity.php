<?php

namespace App\Actions\APIs\Accelerate;

use App\Models\Transaction;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Actions\Utils\TransactionHelpers;
use App\Models\ElectricityBillTransaction;
use Illuminate\Validation\ValidationException;

class Electricity
{
    public function handle(Transaction $transaction, ElectricityBillTransaction $electricityBillTransaction, ?TransactionApi $api = null): string
    {
        $client = new AccelerateClient($api);
        $helper = new TransactionHelpers();

        $transactionRef = $transaction->reference_id ?: ($transaction->reference ?: 'ACC_PWR_' . $transaction->id . '_' . time());

        $distributor = $electricityBillTransaction->distributor;
        $disco = $distributor?->code ?: $distributor?->name;
        $meterNumber = trim($electricityBillTransaction->meter_number);
        $meterType = $electricityBillTransaction->meter_type;
        $amount = (float) $transaction->amount;

        // 1. Check for cached validation reference
        $cacheKey = 'accelerate_power_val_' . $meterNumber;
        $valRef = Cache::get($cacheKey);

        if (empty($valRef)) {
            Log::info("No cached Accelerate validation reference found for meter {$meterNumber}, validating before vend.");
            $validateResult = $client->validatePower(
                disco: $disco,
                meterNumber: $meterNumber,
                meterType: $meterType,
                amount: $amount
            );

            $valData = $validateResult['data']['data'] ?? $validateResult['data'] ?? [];
            $valRef = $valData['validation_reference'] 
                ?? $valData['validationReference'] 
                ?? $validateResult['data']['validation_reference'] 
                ?? null;

            if (empty($valRef)) {
                $err = $validateResult['data']['message'] ?? $validateResult['data']['error'] ?? 'Unable to validate meter number before vending.';
                $helper->reverseTransaction($transaction, is_array($err) ? json_encode($err) : (string)$err);

                throw ValidationException::withMessages([
                    'status' => 'Meter validation failed: ' . (is_array($err) ? json_encode($err) : (string)$err),
                ]);
            }
        }

        // 2. Vend Power
        try {
            $vendResult = $client->vendPower(
                validationReference: $valRef,
                transactionReference: $transactionRef
            );

            $httpCode = $vendResult['http_code'];
            $res = $vendResult['data'];

            Log::info('Accelerate Power Vend Processed', [
                'transaction_id' => $transaction->id,
                'http_code' => $httpCode,
                'response' => $res,
            ]);

            $isSuccess = ($httpCode === 200) && (
                ($res['status'] ?? '') === 'success' ||
                ($res['status'] ?? '') === 'SUCCESS' ||
                ($res['code'] ?? '') === '000' ||
                ($res['code'] ?? '') === 200 ||
                (!empty($res['data']) && ($res['data']['status'] ?? '') === 'fulfilled')
            );

            $isAccepted = ($httpCode === 202) || (($res['status'] ?? '') === 'processing') || (($res['status'] ?? '') === 'pending');

            if ($isSuccess) {
                $data = $res['data'] ?? $res;
                $token = $data['token'] 
                    ?? $data['creditToken'] 
                    ?? $data['pin'] 
                    ?? $data['purchased_code'] 
                    ?? $data['meter_token'] 
                    ?? ($res['token'] ?? null);

                $metadata = $transaction->metadata ?? [];
                if (!empty($token)) {
                    $metadata['token'] = (string) $token;
                    $electricityBillTransaction->update([
                        'token' => (string) $token,
                    ]);
                }

                $transaction->update([
                    'status' => 'success',
                    'metadata' => $metadata,
                    'api_response' => !empty($token) ? (string) $token : json_encode($res),
                    'provider_name' => 'Accelerate',
                    'provider_reference' => $transactionRef,
                ]);

                Cache::forget($cacheKey);

                return $transaction->status;
            }

            if ($isAccepted) {
                // Requery
                $requery = $client->requeryPower($transactionRef);
                $rqData = $requery['data']['data'] ?? $requery['data'] ?? [];
                $rqStatus = strtolower($rqData['status'] ?? '');

                if ($rqStatus === 'fulfilled' || $rqStatus === 'success' || $rqStatus === 'successful') {
                    $token = $rqData['token'] 
                        ?? $rqData['creditToken'] 
                        ?? $rqData['pin'] 
                        ?? $rqData['purchased_code'] 
                        ?? null;

                    $metadata = $transaction->metadata ?? [];
                    if (!empty($token)) {
                        $metadata['token'] = (string) $token;
                        $electricityBillTransaction->update([
                            'token' => (string) $token,
                        ]);
                    }

                    $transaction->update([
                        'status' => 'success',
                        'metadata' => $metadata,
                        'api_response' => !empty($token) ? (string) $token : json_encode($requery['data']),
                        'provider_name' => 'Accelerate',
                        'provider_reference' => $transactionRef,
                    ]);

                    Cache::forget($cacheKey);

                    return $transaction->status;
                }

                if ($rqStatus === 'processing' || $rqStatus === 'pending' || $requery['http_code'] === 202) {
                    $transaction->update([
                        'status' => 'pending',
                        'api_response' => json_encode($res),
                        'provider_name' => 'Accelerate',
                        'provider_reference' => $transactionRef,
                    ]);

                    return $transaction->status;
                }
            }

            // Failed
            $errorMsg = $res['message'] ?? $res['error'] ?? 'Power vending failed.';
            $errorStr = is_array($errorMsg) ? json_encode($errorMsg) : (string) $errorMsg;

            $helper->reverseTransaction($transaction, $errorStr);

            return $transaction->status;

        } catch (\Exception $e) {
            Log::error('Accelerate Power Vend Error: ' . $e->getMessage());
            $helper->reverseTransaction($transaction, $e->getMessage());

            return $transaction->status;
        }
    }
}
