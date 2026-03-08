<?php

namespace App\Http\Controllers\User;

use App\Actions\Promo\FundBonusWallet;
use Inertia\Inertia;
use App\Models\Referral;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Models\WalletTransaction;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReferralResource;
use Illuminate\Validation\ValidationException;

class ReferralController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function index(Request $request)
    {

        $referrals = Referral::where('user_id', auth()->user()->id)->with('user:id,name,phone,email,email_verified_at')->get();


        if($request->wantsJson() ){

            return response(ReferralResource::collection($referrals));

        }

        return Inertia::render('Referrals/Index', [
            'referrals'=> ReferralResource::collection($referrals),
            'enable_withdrawal'=> config('settings.bonus_withdrawal_enable')
        ]);

    }

    public function claimReferralBonus(Request $request, Referral $referral) {

        if($referral->claimed){
            throw ValidationException::withMessages([
                'status' => $error ?? 'Already Claimed!',
            ]);
        }

        $fundBonusWallet =  new FundBonusWallet();

        $referral->update([
            'claimed'=> 1,
        ]);

        $fundBonusWallet->handle(['amount'=> $referral->bonus_earn], 'Referral Reward', auth()->user());

        // update referrals to claimed
        // fund bonus wallet

        return redirect()->back();

    }

    public function withdrawBonus(Request $request)
    {

       $user = auth()->user();
       $wallet = $user->wallet;

       $data= $request->validate([
            'amount'=> "required|numeric|max:$wallet->bonus_balance"
        ]);

        if(config('settings.bonus_withdrawal_enable') != "1"){
            throw ValidationException::withMessages([
                'status' => $error ?? 'Withdrawal Not Available',
            ]);
        }

        $balance_before = $wallet->balance;
        $wallet->decrement('bonus_balance', $data['amount']);
        $wallet->increment('balance', $data['amount']);
        $balance_after = $wallet->balance;


         // Store Transaction Records
        $transactionable = WalletTransaction::create([
            'user_id' => $user->id,
            'wallet_id' => $user->wallet->id,
            'amount' => $data['amount'],
            'type'=> 'credit',
            'method'=> 'BONUS WELLET WITHDRAWAL',
        ]);

        // Store General Transaction
        $transactionable->transaction()->create([
            'reference'=> $this->generateRef(),
            'user_id' => $user->id,
            'amount' => $data['amount'],
            'status' => 'success',
            'api_response'=> "Bonus wallet withdrawal",
            'balance_before'=> $balance_before,
            'balance_after'=> $balance_after,
        ]);


        return redirect()->back();


    }


    private function generateRef() {
        $number = 'WT'.now()->month.now()->year.mt_rand(100000, 999999);
        if (Transaction::wherereference($number)->exists()){
            return $this->generateRef();
        }
        return $number;
    }





}
