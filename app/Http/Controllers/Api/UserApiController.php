<?php

namespace App\Http\Controllers\Api;

use App\Actions\MonnifyKyc;
use App\Http\Controllers\Controller;
use App\Models\AirtimeToCashTransaction;
use App\Models\AppConfiguration;
use App\Models\MobileNetwork;
use App\Models\Referral;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Utils\Transaction\TransactionHelper;
use App\Utils\User\AccountHelper;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserApiController extends Controller
{
    protected AccountHelper $accountHelpers;
    protected TransactionHelper $transactionHelpers;

    public function __construct(AccountHelper $accountHelpers)
    {
        $this->accountHelpers = $accountHelpers;
        $this->transactionHelpers = new TransactionHelper();
    }

    /**
     * Withdraw bonus balance to main wallet balance.
     */
    public function withdrawBonus(Request $request): JsonResponse
    {
        $user = $request->user();
        $wallet = $user->wallet;

        if (!$wallet) {
            return response()->json([
                'status' => 'error',
                'message' => 'Wallet not found for this account.',
            ], 404);
        }

        $request->validate([
            'amount' => ['required', 'numeric', 'min:10', 'max:' . max(10, $wallet->bonus_balance)],
        ]);

        $amount = (float) $request->input('amount');

        if ($amount > $wallet->bonus_balance) {
            return response()->json([
                'status' => 'error',
                'message' => 'Insufficient bonus balance.',
            ], 422);
        }

        try {
            DB::beginTransaction();

            $balanceBefore = $wallet->balance;
            $wallet->decrement('bonus_balance', $amount);
            $wallet->increment('balance', $amount);
            $balanceAfter = $wallet->fresh()->balance;

            $reference = 'WT' . now()->format('YmdHis') . mt_rand(1000, 9999);

            Transaction::create([
                'reference_id' => $reference,
                'user_id' => $user->id,
                'type' => 'WALLET',
                'amount' => $amount,
                'status' => 'SUCCESS',
                'provider_name' => 'SYSTEM',
                'provider_reference' => $reference,
                'description' => 'Bonus wallet conversion to main balance',
                'api_response' => 'Bonus converted successfully',
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'metadata' => [
                    'ledger_type' => 'credit',
                    'method' => 'BONUS_WALLET_WITHDRAWAL',
                    'wallet_type' => 'balance',
                    'source' => 'bonus_balance',
                ],
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Bonus balance transferred to main wallet successfully.',
                'data' => [
                    'balance' => $wallet->fresh()->balance,
                    'bonus_balance' => $wallet->fresh()->bonus_balance,
                ],
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Bonus withdrawal API error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process bonus withdrawal. Please try again.',
            ], 500);
        }
    }

    /**
     * Get user's referral code, link, bonus balance, and referral history.
     */
    public function getReferrals(Request $request): JsonResponse
    {
        $isEnabled = in_array(
            AppConfiguration::where('key', 'feat_enable_referral')->first()?->value ?? config('settings.feat_enable_referral', '1'),
            ['1', 1, 'true', true],
            false
        );
        if (!$isEnabled) {
            return response()->json([
                'status' => 'error',
                'message' => 'Referral program is currently disabled by administrator.',
            ], 403);
        }

        $user = $request->user();
        $wallet = $user->wallet;

        $referralCode = $user->username ?? $user->phone_number ?? (string) $user->id;
        $referralLink = url('/register?ref=' . $referralCode);

        $referrals = Referral::where('user_id', $user->id)
            ->with('user:id,name,phone_number,email,created_at')
            ->latest()
            ->get()
            ->map(function ($ref) {
                return [
                    'id' => $ref->id,
                    'referred_name' => $ref->user?->name ?? 'Referred User',
                    'referred_phone' => $ref->user?->phone_number ?? '',
                    'bonus_earned' => (float) ($ref->bonus_earn ?? 0),
                    'claimed' => (bool) $ref->claimed,
                    'date' => $ref->created_at?->toIso8601String() ?? now()->toIso8601String(),
                ];
            });

        $totalEarned = (float) Referral::where('user_id', $user->id)->sum('bonus_earn');

        return response()->json([
            'status' => 'success',
            'data' => [
                'referral_code' => $referralCode,
                'referral_link' => $referralLink,
                'bonus_balance' => (float) ($wallet?->bonus_balance ?? 0),
                'total_earned' => $totalEarned,
                'total_referrals' => $referrals->count(),
                'referrals' => $referrals,
            ],
        ]);
    }

    /**
     * Submit BVN to upgrade KYC level.
     */
    public function upgradeKycBvn(Request $request, MonnifyKyc $monnifyKyc): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'bvn' => 'required|digits:11',
            'phone' => 'required|string|min:10',
        ]);

        $user = $request->user();

        try {
            $isMonnifyKycEnabled = in_array(config('settings.feat_enable_kyc_bvn'), ['1', 1, 'true', true], true);

            if ($isMonnifyKycEnabled) {
                $res = $monnifyKyc->validateBvn($request->name, $request->bvn, $request->phone);
                if (!isset($res['status']) || $res['status'] !== 'success' || ($res['matchPercentage'] ?? 0) <= 50) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'BVN validation failed. Name and details did not match.',
                    ], 422);
                }
            }

            $user->update([
                'bvn' => function_exists('cs_encrypt') ? cs_encrypt($request->bvn) : $request->bvn,
                'name' => $request->name,
                'kyc_verified_at' => now(),
                'account_status' => 'active',
                'kyc_level' => 2,
            ]);

            // Generate virtual accounts if needed
            if (!$user->fundingAccounts()->where('account_type', '!=', 'temporary')->exists()) {
                $this->accountHelpers->generateVirtualAccount($user);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'BVN verification completed. Account upgraded successfully.',
            ]);
        } catch (Exception $e) {
            Log::error('API BVN KYC upgrade error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Verification failed. Please check details and try again.',
            ], 500);
        }
    }

    /**
     * Submit NIN to upgrade KYC level.
     */
    public function upgradeKycNin(Request $request, MonnifyKyc $monnifyKyc): JsonResponse
    {
        $request->validate([
            'nin' => 'required|digits:11',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|min:10',
        ]);

        $user = $request->user();

        try {
            $isMonnifyKycEnabled = in_array(config('settings.feat_enable_kyc_nin'), ['1', 1, 'true', true], true);

            if ($isMonnifyKycEnabled) {
                $res = $monnifyKyc->validateNin($request->name, $request->nin, $request->phone);
                if (!isset($res['status']) || $res['status'] !== 'success') {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'NIN validation failed. Details did not match.',
                    ], 422);
                }
            }

            $user->update([
                'nin' => function_exists('cs_encrypt') ? cs_encrypt($request->nin) : $request->nin,
                'name' => $request->name,
                'kyc_verified_at' => now(),
                'account_status' => 'active',
                'kyc_level' => 2,
            ]);

            // Generate virtual accounts if needed
            if (!$user->fundingAccounts()->where('account_type', '!=', 'temporary')->exists()) {
                $this->accountHelpers->generateVirtualAccount($user);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'NIN verification completed. Account upgraded successfully.',
            ]);
        } catch (Exception $e) {
            Log::error('API NIN KYC upgrade error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Verification failed. Please check details and try again.',
            ], 500);
        }
    }

    /**
     * Get Airtime to Cash configurations, active networks, and receiver phone numbers.
     */
    public function getAirtimeToCashConfig(): JsonResponse
    {
        $networks = MobileNetwork::whereNotIn('name', ['KIRANI', 'SMILE'])
            ->get()
            ->map(function ($net) {
                return [
                    'id' => $net->id,
                    'name' => $net->name,
                    'code' => $net->code,
                    'conversion_rate' => (float) ($net->a2c_conversion_rate ?? 80),
                    'is_active' => (bool) ($net->a2c_manual_method_enabled ?? true),
                ];
            });

        $receiverPhones = [
            'MTN' => config('settings.a2c_mtn_phone_number') ?? '08030000000',
            'GLO' => config('settings.a2c_glo_phone_number') ?? '08050000000',
            '9MOBILE' => config('settings.a2c_ninemoble_phone_number') ?? '08090000000',
            'AIRTEL' => config('settings.a2c_airtel_phone_number') ?? '08020000000',
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'min_amount' => 500,
                'max_amount' => 50000,
                'networks' => $networks,
                'receiver_phones' => $receiverPhones,
            ],
        ]);
    }

    /**
     * Submit an Airtime to Cash transaction request.
     */
    public function submitAirtimeToCash(Request $request): JsonResponse
    {
        $request->validate([
            'network_id' => 'required|exists:mobile_networks,id',
            'amount' => 'required|numeric|min:500|max:50000',
            'sender_phone' => 'required|string',
            'receiver_phone' => 'required|string',
            'has_transferred' => 'required|boolean',
        ]);

        if (!$request->input('has_transferred')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please confirm that you have transferred the airtime before submitting.',
            ], 422);
        }

        $user = $request->user();
        $network = MobileNetwork::find($request->input('network_id'));

        if (!$network) {
            return response()->json([
                'status' => 'error',
                'message' => 'Selected network not found.',
            ], 404);
        }

        $conversionRate = (float) ($network->a2c_conversion_rate ?? 80);
        $amount = (float) $request->input('amount');
        $convertedAmount = $amount * ($conversionRate / 100);

        try {
            DB::beginTransaction();

            $reference = $this->transactionHelpers->generateTransactionRef('ATC');

            $tx = AirtimeToCashTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'converted_amount' => $convertedAmount,
                'quantity' => 1,
                'convertion_rate' => $conversionRate,
                'sessionId' => 'manual-app-' . time(),
                'mobile_network_id' => $network->id,
                'phone_number' => $request->input('sender_phone'),
                'reference' => $reference,
                'status' => 'processing',
                'api_response' => 'Manual Airtime to Cash initiated via Mobile App',
                'receiver_phone' => $request->input('receiver_phone'),
                'is_manual' => true,
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Your airtime transfer has been submitted and is under review. Your wallet will be credited shortly.',
                'data' => [
                    'reference' => $reference,
                    'amount' => $amount,
                    'converted_amount' => $convertedAmount,
                    'status' => 'processing',
                ],
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('API Airtime to Cash submit error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to submit airtime transfer. Please try again.',
            ], 500);
        }
    }
}
