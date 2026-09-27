<?php

namespace App\Http\Controllers\User;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
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

class IdentityVerificationController extends Controller
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
     * Display the identity verification page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $ninFee = $this->resolveFee(config('settings.nin_verification_charge', '100'));
        $bvnFee = $this->resolveFee(config('settings.bvn_verification_charge', '100'));

        $recentVerifications = Transaction::where('user_id', $user->id)
            ->whereIn('type', ['NIN_VERIFICATION', 'BVN_VERIFICATION'])
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Verification/Index', [
            'nin_fee' => $ninFee,
            'bvn_fee' => $bvnFee,
            'nin_enabled' => (bool) in_array(config('settings.feat_enable_nin_verification', '1'), ['1', 1, 'true', true], true),
            'bvn_enabled' => (bool) in_array(config('settings.feat_enable_bvn_verification', '1'), ['1', 1, 'true', true], true),
            'recent_verifications' => $recentVerifications,
            'verification_result' => session('verification_result'),
            'flash_error' => session('error'),
            'app_name' => config('settings.site_name', config('app.name', 'SuperSub')),
            'is_sandbox' => (bool) str_starts_with(config('services.africverify.api_key', ''), 'test_sk_'),
        ]);
    }

    /**
     * Perform NIN Verification.
     */
    public function verifyNin(VerifyNinRequest $request)
    {
        $user = $request->user();
        $nin = (string) $request->input('nin');

        if (!in_array(config('settings.feat_enable_nin_verification', '1'), ['1', 1, 'true', true], true)) {
            throw ValidationException::withMessages([
                'service' => 'NIN verification service is currently disabled.',
            ]);
        }

        $this->helpers->validateTransactionPin($user, $request->input('transaction_pin'));

        $fee = $this->resolveFee(config('settings.nin_verification_charge', '100'));
        $this->helpers->validateUserSpendingLimit($user, $fee);

        $masked = substr($nin, 0, 2) . '******' . substr($nin, -3);
        $reference = $this->helpers->generateTransactionRef('NV');
        $description = "NIN Verification ({$masked})";

        $transaction = $this->createPendingTransaction(
            $user,
            'NIN_VERIFICATION',
            $fee,
            $reference,
            $description,
            $masked,
            $request->ip()
        );

        try {
            $identity = $this->verifyNin->handle($transaction, $nin);

            $resultData = [
                'type' => 'NIN',
                'identifier' => $masked,
                'reference' => $transaction->reference_id,
                'identity' => $identity,
                'verified_at' => now()->toDateTimeString(),
            ];

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'NIN verification successful.',
                    'data' => $resultData,
                ]);
            }

            return back()->with([
                'verification_result' => $resultData,
                'success' => 'NIN verification completed successfully.',
            ]);

        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            Log::error('NIN Verification Controller Exception: ' . $e->getMessage());
            throw ValidationException::withMessages([
                'service' => 'Verification failed: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Perform BVN Verification.
     */
    public function verifyBvn(VerifyBvnRequest $request)
    {
        $user = $request->user();
        $bvn = (string) $request->input('bvn');

        if (!in_array(config('settings.feat_enable_bvn_verification', '1'), ['1', 1, 'true', true], true)) {
            throw ValidationException::withMessages([
                'service' => 'BVN verification service is currently disabled.',
            ]);
        }

        $this->helpers->validateTransactionPin($user, $request->input('transaction_pin'));

        $fee = $this->resolveFee(config('settings.bvn_verification_charge', '100'));
        $this->helpers->validateUserSpendingLimit($user, $fee);

        $masked = substr($bvn, 0, 2) . '******' . substr($bvn, -3);
        $reference = $this->helpers->generateTransactionRef('BV');
        $description = "BVN Verification ({$masked})";

        $transaction = $this->createPendingTransaction(
            $user,
            'BVN_VERIFICATION',
            $fee,
            $reference,
            $description,
            $masked,
            $request->ip()
        );

        try {
            $identity = $this->verifyBvn->handle($transaction, $bvn);

            $resultData = [
                'type' => 'BVN',
                'identifier' => $masked,
                'reference' => $transaction->reference_id,
                'identity' => $identity,
                'verified_at' => now()->toDateTimeString(),
            ];

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'BVN verification successful.',
                    'data' => $resultData,
                ]);
            }

            return back()->with([
                'verification_result' => $resultData,
                'success' => 'BVN verification completed successfully.',
            ]);

        } catch (ValidationException $e) {
            throw $e;
        } catch (Exception $e) {
            Log::error('BVN Verification Controller Exception: ' . $e->getMessage());
            throw ValidationException::withMessages([
                'service' => 'Verification failed: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Helper to atomically deduct wallet balance and initialize a PENDING transaction.
     */
    protected function createPendingTransaction(
        $user,
        string $type,
        float $fee,
        string $reference,
        string $description,
        string $maskedIdentifier,
        ?string $ip
    ): Transaction {
        try {
            DB::beginTransaction();

            $balance = $this->helpers->validateBalanceAndDeductAmount($user->id, $fee);

            $transaction = Transaction::create([
                'reference_id' => $reference,
                'user_id' => $user->id,
                'type' => $type,
                'amount' => $fee,
                'status' => 'PENDING',
                'description' => $description,
                'provider_name' => 'AfricVerify',
                'provider_reference' => $reference,
                'api_process_started_at' => now(),
                'balance_before' => (float) $balance['before'],
                'balance_after' => (float) $balance['after'],
                'request_ip' => $ip,
                'metadata' => [
                    'beneficiary' => $maskedIdentifier,
                    'service' => $type,
                    'requested_at' => now()->toDateTimeString(),
                ],
            ]);

            DB::commit();

            return $transaction;

        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Failed to initialize {$type} transaction: " . $e->getMessage());
            throw ValidationException::withMessages([
                'amount' => $e->getMessage() ?: 'Insufficient wallet balance or account error.',
            ]);
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
