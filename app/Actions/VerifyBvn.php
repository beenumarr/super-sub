<?php

namespace App\Actions;

use Exception;
use App\Models\Transaction;
use App\Services\AfricVerify\AfricVerifyService;
use App\Actions\Utils\ReverseTransaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class VerifyBvn
{
    protected AfricVerifyService $service;
    protected ReverseTransaction $reverseTransaction;

    public function __construct(AfricVerifyService $service, ReverseTransaction $reverseTransaction)
    {
        $this->service = $service;
        $this->reverseTransaction = $reverseTransaction;
    }

    /**
     * Process BVN Verification through AfricVerify.
     *
     * @param Transaction $transaction
     * @param string $bvn
     * @return array
     * @throws ValidationException
     */
    public function handle(Transaction $transaction, string $bvn): array
    {
        $idempotencyKey = 'bvn-' . ($transaction->reference_id ?: uniqid());

        try {
            $result = $this->service->verifyBvn($bvn, $idempotencyKey);

            $accountVerified = (bool) ($result['account_verified'] ?? false);
            $verificationStatus = strtoupper((string) ($result['verification_status'] ?? ''));

            if ($accountVerified || $verificationStatus === 'VERIFIED') {
                $metadata = array_merge($transaction->metadata ?? [], [
                    'verified' => true,
                    'verification_status' => $result['verification_status'] ?? 'verified',
                    'identity' => $result['identity'] ?? [],
                    'billing_info' => $result['billing_info'] ?? null,
                    'verification_reference' => $result['verification']['reference'] ?? null,
                    'request_id' => $result['request_id'] ?? null,
                ]);

                $transaction->update([
                    'status' => 'SUCCESS',
                    'provider_name' => 'AfricVerify',
                    'provider_reference' => $result['verification']['reference'] ?? ($result['request_id'] ?? $transaction->reference_id),
                    'api_response' => $result['message'] ?? 'BVN verified successfully.',
                    'metadata' => $metadata,
                    'api_response_received_at' => now(),
                ]);

                return $result['identity'] ?? [];
            }

            // Not verified (no record found on BVN database)
            $errorMessage = $result['message'] ?? 'No banking record found matching the submitted BVN.';

            $this->reverseTransaction->handle($transaction, [
                'api_response' => $errorMessage,
            ]);

            throw ValidationException::withMessages([
                'bvn' => $errorMessage,
            ]);

        } catch (ValidationException $e) {
            $this->reverseTransaction->handle($transaction, [
                'api_response' => $e->getMessage(),
            ]);
            throw $e;
        } catch (Exception $e) {
            Log::error('VerifyBvn Action Exception: ' . $e->getMessage(), [
                'transaction_id' => $transaction->id,
            ]);

            $this->reverseTransaction->handle($transaction, [
                'api_response' => 'Verification failed: ' . $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'service' => 'Verification failed: ' . $e->getMessage(),
            ]);
        }
    }
}
