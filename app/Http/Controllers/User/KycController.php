<?php

namespace App\Http\Controllers\User;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use App\Actions\MonnifyKyc;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Utils\User\AccountHelper;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Validation\ValidationException;

class KycController extends Controller
{
    protected $accountHelpers;
    protected $helper;

    public function __construct(AccountHelper $accountHelpers)
    {
        $this->accountHelpers = $accountHelpers;
    }

    public function getKycDetails(Request $request)
    {
        $user = $request->user(); // Or you can use Auth::user() to get the authenticated user

        try {
            // Decrypt BVN and NIN
            $decryptedBvn = $user->bvn ? cs_decrypt($user->bvn) : null;
            $decryptedNin = $user->nin ? cs_decrypt($user->nin) : null;

            // Mask BVN and NIN
            $maskedBvn = $decryptedBvn ? maskSensitiveData($decryptedBvn) : null;
            $maskedNin = $decryptedNin ? maskSensitiveData($decryptedNin) : null;

            // Return response as JSON
            return response()->json([
                'bvn' => $maskedBvn,
                'nin' => $maskedNin,
                'date' => $user->kyc_verified_at
            ], 200);

        } catch (\Exception $e) {
            // Handle decryption or other failures
            return response()->json(['error' => 'Failed to retrieve KYC details.'], 500);
        }
    }



    /**
     * Display KYC page
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Profile/Kyc/Index', [
            'nin_kyc_enabled' => config('settings.feat_enable_kyc_nin') === "1",
            'bvn_kyc_enabled' => config('settings.feat_enable_kyc_bvn') === "1",
        ]);
    }

    /**
     * Display BVN KYC page
     */
    public function kycBvn(Request $request): Response
    {
        return Inertia::render('Profile/Kyc/Bvn');
    }

    /**
     * Handle BVN KYC submission and validation
     */
    public function updateKycBvn(Request $request, MonnifyKyc $monnifyKyc)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'bvn' => 'required|digits:11',
            'phone' => 'required|string|min:10',
        ]);

        try {
            if (config('settings.feat_enable_kyc_bvn')) {
                $res = $monnifyKyc->validateBvn($request->name, $request->bvn, $request->phone);

                if (isset($res['status']) && $res['status'] === 'success' && $res['matchPercentage'] > 50) {
                    $this->updateKyc($user, ['bvn' => cs_encrypt($request->bvn), 'name'=> $request->name]);
                } else {
                    throw ValidationException::withMessages(['bvn' => 'BVN validation failed. Please try again.']);
                }
            }

            if($request->wantsJson() ){

                return response(['status'=> 'success', 'message'=> 'BVN KYC updated successfully.']);

            }

            return redirect()->route('kyc')->with('success', 'BVN KYC updated successfully.');

        } catch (\Exception $e) {
            Log::error('Error updating BVN KYC for user ' . $user->id, ['exception' => $e]);
            throw ValidationException::withMessages(['status' => 'Something went wrong. Please try again later.']);
        }
    }

    /**
     * Display NIN KYC page
     */
    public function kycNin(Request $request): Response
    {
        return Inertia::render('Profile/Kyc/Nin', [
            'status' => ''
        ]);
    }

    /**
     * Handle NIN KYC submission and validation
     */
    public function updateKycNin(Request $request, MonnifyKyc $monnifyKyc)
    {
        $request->validate([
            'nin' => 'required|digits:11',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|min:10',
        ]);

        $user = $request->user();

        try {
            if (config('settings.feat_enable_kyc_nin')) {
                $res = $monnifyKyc->validateNin($request->name, $request->nin, $request->phone);

                if (isset($res['status']) && $res['status'] === 'success') {
                    similar_text($res['name'], Str::upper($request->name), $matchPercentage);

                    if ($matchPercentage > 50) {
                        $this->updateKyc($user, ['nin' => cs_encrypt($request->nin), 'name'=> $request->name]);

                        if($request->wantsJson() ){

                            return response(['status'=> 'success', 'message'=> 'NIN KYC updated successfully.']);

                        }

                        return redirect()->route('kyc')->with('success', 'NIN KYC updated successfully.');
                    } else {
                        throw ValidationException::withMessages(['name' => 'Names do not match.']);
                    }
                } else {
                    throw ValidationException::withMessages(['status' => 'NIN validation failed. Please try again.']);
                }
            }

        } catch (\Exception $e) {
            Log::error('Error updating NIN KYC for user ' . $user->id, ['exception' => $e]);
            throw ValidationException::withMessages(['status' => 'Something went wrong. Please try again later.']);
        }
    }

    /**
     * Update KYC data for a user
     */
    private function updateKyc(User $user, array $data)
    {
        $user->update([
            ...$data,
            'kyc_verified_at' => now(),
            'account_status'=> 'active',
            'kyc_level'=> 'level1'
        ]);

        // Generate virtual account if none exists
        if (!$user->fundingAccounts()->where('account_type','!=', 'temporary')->exists()) {
            $this->accountHelpers->generateVirtualAccount($user);
        }
    }
}
