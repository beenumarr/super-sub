<?php

namespace App\Http\Controllers\Api;

use Exception;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Actions\VerifyNin;
use App\Actions\VerifyBvn;
use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\VerifyNinRequest;
use App\Http\Requests\Transaction\VerifyBvnRequest;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class VerificationApiController extends Controller
{
    protected TransactionHelper $helpers;
    protected VerifyNin $verifyNin;
    protected VerifyBvn $verifyBvn;

    public function __construct(
        TransactionHelper $helpers,
        VerifyNin $verifyNin,
        VerifyBvn $verifyBvn
    ) {
        $this->helpers = $helpers;
        $this->verifyNin = $verifyNin;
        $this->verifyBvn = $verifyBvn;
    }

    /**
     * Get current verification pricing and available services.
     */
    public function pricing()
    {
        return response()->json([
            'success' => true,
            'services' => [
                'nin' => [
                    'name' => 'National Identity Number Verification',
                    'enabled' => (bool) in_array(config('settings.feat_enable_nin_verification', '1'), ['1', 1, 'true', true], true),
                    'price' => $this->resolveFee(config('settings.nin_verification_charge', '100')),
                    'currency' => 'NGN',
                ],
                'bvn' => [
                    'name' => 'Bank Verification Number Verification',
                    'enabled' => (bool) in_array(config('settings.feat_enable_bvn_verification', '1'), ['1', 1, 'true', true], true),
                    'price' => $this->resolveFee(config('settings.bvn_verification_charge', '100')),
                    'currency' => 'NGN',
                ],
            ],
        ]);
    }

    /**
     * API endpoint to verify an 11-digit NIN.
     */
    public function verifyNin(VerifyNinRequest $request)
    {
        $user = $request->user();
        $nin = (string) $request->input('nin');

        if (!in_array(config('settings.feat_enable_nin_verification', '1'), ['1', 1, 'true', true], true)) {
            return response()->json([
                'success' => false,
                'message' => 'NIN verification service is currently disabled.',
            ], 403);
        }

        $fee = $this->resolveFee(config('settings.nin_verification_charge', '100'));
        $this->helpers->validateUserSpendingLimit($user, $fee);

        $masked = substr($nin, 0, 2) . '******' . substr($nin, -3);
        $reference = $this->helpers->generateTransactionRef('NV');
        $description = "API NIN Verification ({$masked})";

        try {
            DB::beginTransaction();
            $balance = $this->helpers->validateBalanceAndDeductAmount($user->id, $fee);

            $transaction = Transaction::create([
                'reference_id' => $reference,
                'user_id' => $user->id,
                'type' => 'NIN_VERIFICATION',
                'amount' => $fee,
                'status' => 'PENDING',
                'description' => $description,
                'provider_name' => 'AfricVerify',
                'provider_reference' => $reference,
                'api_process_started_at' => now(),
                'balance_before' => (float) $balance['before'],
                'balance_after' => (float) $balance['after'],
                'request_ip' => $request->ip(),
                'vending_medium' => 'API',
                'metadata' => [
                    'beneficiary' => $masked,
                    'service' => 'NIN_VERIFICATION',
                    'client' => 'API',
                ],
            ]);
            DB::commit();

            $identity = $this->verifyNin->handle($transaction, $nin);

            return response()->json([
                'success' => true,
                'status' => 'SUCCESS',
                'reference' => $transaction->reference_id,
                'service' => 'NIN_VERIFICATION',
                'data' => $identity,
                'balance_after' => (float) $balance['after'],
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'status' => 'FAILED',
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('API NIN Verification Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'status' => 'FAILED',
                'message' => 'Transaction failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API endpoint to verify an 11-digit BVN.
     */
    public function verifyBvn(VerifyBvnRequest $request)
    {
        $user = $request->user();
        $bvn = (string) $request->input('bvn');

        if (!in_array(config('settings.feat_enable_bvn_verification', '1'), ['1', 1, 'true', true], true)) {
            return response()->json([
                'success' => false,
                'message' => 'BVN verification service is currently disabled.',
            ], 403);
        }

        $fee = $this->resolveFee(config('settings.bvn_verification_charge', '100'));
        $this->helpers->validateUserSpendingLimit($user, $fee);

        $masked = substr($bvn, 0, 2) . '******' . substr($bvn, -3);
        $reference = $this->helpers->generateTransactionRef('BV');
        $description = "API BVN Verification ({$masked})";

        try {
            DB::beginTransaction();
            $balance = $this->helpers->validateBalanceAndDeductAmount($user->id, $fee);

            $transaction = Transaction::create([
                'reference_id' => $reference,
                'user_id' => $user->id,
                'type' => 'BVN_VERIFICATION',
                'amount' => $fee,
                'status' => 'PENDING',
                'description' => $description,
                'provider_name' => 'AfricVerify',
                'provider_reference' => $reference,
                'api_process_started_at' => now(),
                'balance_before' => (float) $balance['before'],
                'balance_after' => (float) $balance['after'],
                'request_ip' => $request->ip(),
                'vending_medium' => 'API',
                'metadata' => [
                    'beneficiary' => $masked,
                    'service' => 'BVN_VERIFICATION',
                    'client' => 'API',
                ],
            ]);
            DB::commit();

            $identity = $this->verifyBvn->handle($transaction, $bvn);

            return response()->json([
                'success' => true,
                'status' => 'SUCCESS',
                'reference' => $transaction->reference_id,
                'service' => 'BVN_VERIFICATION',
                'data' => $identity,
                'balance_after' => (float) $balance['after'],
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'status' => 'FAILED',
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('API BVN Verification Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'status' => 'FAILED',
                'message' => 'Transaction failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Parse numeric fee from configured string (e.g., "100", "100 N", or "₦100").
     */
    protected function resolveFee(mixed $rawFee): float
    {
        if (is_numeric($rawFee)) {
            return (float) $rawFee;
        }

        $clean = preg_replace('/[^\d.]/', '', (string) $rawFee);
        return is_numeric($clean) && (float) $clean > 0 ? (float) $clean : 100.0;
    }
}
