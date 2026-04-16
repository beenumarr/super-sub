<?php

namespace App\Http\Controllers\User;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Models\FundingMethod;
use App\Models\FundingAccount;
use App\Models\Transaction;
use App\Utils\User\AccountHelper;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Utils\Transaction\TransactionHelper;
use Illuminate\Validation\ValidationException;

class WalletFundingController extends Controller
{
    protected $helpers;

    public function __construct(TransactionHelper $helpers)
    {
        $this->helpers = $helpers;
    }
    /**
     * Display the user's profile form.
     */
    public function index(Request $request): Response
    {
        $active = FundingMethod::whereActive(1)->pluck('code');


        return Inertia::render('WalletFunding/Index', [
            'funding_accounts' => FundingAccount::where('user_id', $request->user()->id)->whereIn('bank_code', $active)->where('account_type', '!=', 'temporary')->get(),
            'temp_funding_accounts' => FundingAccount::where('user_id', $request->user()->id)->whereIn('bank_code', $active)->where('account_type', 'temporary')->get(),
            'methods' => FundingMethod::whereActive(1)->get(['code', 'active'])
            ->keyBy('code')
            ->transform(function ($setting) {
                return $setting->active && true;
            })
            ->toArray(),
        ]);

    }


    public function refreshAccounts(Request $request)
    {
        return null;
        $accountHelper = new AccountHelper();

        $user = auth()->user();

        $accountHelper->generateVirtualAccount($user);


        if($request->wantsJson() ){

            return response()->noContent();

        }

        return redirect()->route('funding')->with('success', ' updated successfully.');


    }


    public function getTempAccount(Request $request)
    {

        $serviceEnabled = config('settings.feat_enable_temp_account');

        if ($serviceEnabled != '1') {
            throw ValidationException::withMessages([
                'status' => 'Service Unavailable! Try again Letter',
            ]);
        }

        $accountHelper = new AccountHelper();

        $user = auth()->user();

        $accountHelper->generateTemporaryAccount($user);

        if($request->wantsJson() ){

            return response()->noContent();

        }

        return redirect()->route('funding')->with('success', 'NIN KYC updated successfully.');
    }


    public function transferToWallet(Request $request)
    {

        $user = auth()->user();
        $amount = (float)$request->amount;
        $this->helpers->checkServiceActive($user, '004', 'airtime_to_cash_transfer');

        $wallet = Wallet::lockForUpdate()->where('user_id', $user->id)->firstOrFail();


        if ($wallet->a2c_balance < $amount) {
            throw ValidationException::withMessages([
              'amount' => 'Insufficient Airtime to Cash balance!',
              'status' => 'Insufficient Airtime to Cash balance!',
          ]);
        }


        DB::beginTransaction();

        $balance_before = $wallet->balance;
        $wallet->decrement('a2c_balance', $amount);
        $wallet->increment('balance', $amount);
        $balance_after = $wallet->balance;
        $reference = $this->helpers->generateTransactionRef('ATC');

        Transaction::create([
            'reference_id' => $reference,
            'user_id' => $user->id,
            'type' => 'WALLET',
            'amount' => $amount,
            'status' => 'SUCCESS',
            'description' => "Wallet transfer ₦{$amount} from Airtime to Cash",
            'provider_name' => 'SYSTEM',
            'provider_reference' => $reference,
            'api_response' => 'Wallet Transfer',
            'balance_before' => $balance_before,
            'balance_after' => $balance_after,
            'metadata' => [
                'ledger_type' => 'credit',
                'method' => 'AIRTIME_TO_CASH',
                'payment_gateway' => 'auto-pilot',
                'source' => 'a2c_balance',
            ],
        ]);

        DB::commit();

        return back()->with('success', 'Wallet Transfer successful.');

    }










}
