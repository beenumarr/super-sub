<?php

namespace App\Actions\APIs\Accelerate;

use App\Models\Transaction;
use App\Models\TransactionApi;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Actions\Utils\TransactionHelpers;
use App\Models\CableSubscriptionTransaction;
use Illuminate\Validation\ValidationException;

class Cable
{
    public function handle(Transaction $transaction, CableSubscriptionTransaction $cableSubscriptionTransaction, ?TransactionApi $api = null): string
    {
        $client = new AccelerateClient($api);
        $helper = new TransactionHelpers();

        $transactionRef = $transaction->reference_id ?: ($transaction->reference ?: 'ACC_TV_' . $transaction->id . '_' . time());

        // 1. Resolve product code for Accelerate
        $productCode = null;
        if ($api) {
            $apiRecord = $cableSubscriptionTransaction->plan->apis->where('transaction_api_id', $api->id)->first();
            $productCode = $apiRecord?->product_code ?: $apiRecord?->product_id;
        }

        if (empty($productCode)) {
            $productCode = $cableSubscriptionTransaction->product_code ?: $cableSubscriptionTransaction->plan->product_code;
        }

        $cableName = $cableSubscriptionTransaction->network->name;
        $smartCardNumber = trim($cableSubscriptionTransaction->smart_card_number);
        $phone = $cableSubscriptionTransaction->phone_number ?: '08000000000';

        // 2. Check for cached validation reference
        $cacheKey = 'accelerate_tv_val_' . $smartCardNumber;
        $valRef = Cache::get($cacheKey);

        if (empty($valRef)) {
            Log::info("No cached Accelerate validation reference found for smartcard {$smartCardNumber}, initiating validation before vend.");
            $validateResult = $client->validateTv(
                provider: $cableName,
                smartCardNumber: $smartCardNumber,
                package: $productCode,
                phone: $phone
            );

            $valData = $validateResult['data']['data'] ?? $validateResult['data'] ?? [];
            $valRef = $valData['validation_reference'] 
                ?? $valData['validationReference'] 
                ?? $validateResult['data']['validation_reference'] 
                ?? null;

            if (empty($valRef)) {
                $err = $validateResult['data']['message'] ?? $validateResult['data']['error'] ?? 'Unable to validate smartcard before vending.';
                $helper->reverseTransaction($transaction, is_array($err) ? json_encode($err) : (string)$err);

                throw ValidationException::withMessages([
                    'status' => 'Smartcard validation failed: ' . (is_array($err) ? json_encode($err) : (string)$err),
                ]);
            }
        }

        // 3. Vend Package
        try {
            $vendResult = $client->vendTv(
                validationReference: $valRef,
                transactionReference: $transactionRef
            );

            $httpCode = $vendResult['http_code'];
            $res = $vendResult['data'];

            Log::info('Accelerate Cable Vend Processed', [
                'transaction_id' => $transaction->id,
                'http_code' => $httpCode,
                'response' => $res,
            ]);

            // Successful status check
            $isSuccess = ($httpCode === 200) && (
                ($res['status'] ?? '') === 'success' ||
                ($res['status'] ?? '') === 'SUCCESS' ||
                ($res['code'] ?? '') === '000' ||
                ($res['code'] ?? '') === 200 ||
                (!empty($res['data']) && ($res['data']['status'] ?? '') === 'fulfilled')
            );

            $isAccepted = ($httpCode === 202) || (($res['status'] ?? '') === 'processing') || (($res['status'] ?? '') === 'pending');

            if ($isSuccess) {
                $transaction->update([
                    'status' => 'success',
                    'api_response' => json_encode($res),
                    'provider_name' => 'Accelerate',
                    'provider_reference' => $transactionRef,
                ]);

                // Clear cached validation reference once consumed
                Cache::forget($cacheKey);

                return $transaction->status;
            }

            if ($isAccepted) {
                // Check requery
                $requery = $client->requeryTv($transactionRef);
                $rqData = $requery['data']['data'] ?? $requery['data'] ?? [];
                $rqStatus = strtolower($rqData['status'] ?? '');

                if ($rqStatus === 'fulfilled' || $rqStatus === 'success' || $rqStatus === 'successful') {
                    $transaction->update([
                        'status' => 'success',
                        'api_response' => json_encode($requery['data']),
                        'provider_name' => 'Accelerate',
                        'provider_reference' => $transactionRef,
                    ]);

                    Cache::forget($cacheKey);
                    return $transaction->status;
                }

                // If still pending, leave as pending
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
            $errorMsg = $res['message'] ?? $res['error'] ?? 'Cable TV vending failed.';
            $errorStr = is_array($errorMsg) ? json_encode($errorMsg) : (string) $errorMsg;

            $helper->reverseTransaction($transaction, $errorStr);

            return $transaction->status;

        } catch (\Exception $e) {
            Log::error('Accelerate Cable Vend Error: ' . $e->getMessage());
            $helper->reverseTransaction($transaction, $e->getMessage());

            return $transaction->status;
        }
    }
}
