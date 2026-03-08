<?php

namespace App\Utils\Transaction;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Transaction;
use App\Models\CableSubscriptionPlan;
use App\Models\DataPlan;
use App\Models\MobileNetwork;
use App\Models\ElectricityDistributor;
use App\Models\FundingMethod;
use App\Models\TransactionApi;
use App\Models\Wallet;
use Illuminate\Validation\ValidationException;


class TransactionHelper
{


    public function checkDuplicate(User $user, $period)
    {
        $thresholdTime = Carbon::now()->subSecond();

        $exists = Transaction::where('user_id', $user->id)->where('created_at', '>=', $thresholdTime)->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'status' => 'Duplicate Transaction! Please try again later.',
            ]);
        }

    }


    public function validateBalanceAndDeductAmount($user_id, $amount)
    {
        $wallet = Wallet::lockForUpdate()->where('user_id', $user_id)->firstOrFail();


        if ($wallet->balance < $amount || $amount < 0) {
            throw ValidationException::withMessages([
              'amount' => 'Insufficient wallet balance!',
          ]);
        }

        $balance_before = $wallet->balance;
        $wallet->decrement('balance', $amount);
        $balance_after = $wallet->balance;

        return ['before'=> $balance_before, 'after'=> $balance_after];


    }


    public function validateUserSpendingLimit(User $user, $amount)
    {
        // Sum all transactions of today for the user
        $totalSpentToday = $user->transactions()->whereToday()->whereNot('transactionable_type', "App\\Models\\WalletTransaction")->sum('amount');

        // Get the user's daily spending limit from the package
        $dailySpendingLimit = $user->package->daily_spending_limit;

        // Check if the total spent today plus the new amount exceeds the daily spending limit
        if (($totalSpentToday + $amount) > $dailySpendingLimit) {
            throw ValidationException::withMessages([
                'status' => 'Sorry Your Daily Spending Limit Exceeded!',
            ]);
        }
    }


    public function checkServiceActive(User $user, $provider_id, $service_type)
    {


        $service_enabled = false;



        // if ($user->account_status === 'restricted') {
        //     throw ValidationException::withMessages([
        //         'status' => 'Your account has been restricted for transaaction, Please submit your KYC to activate your account or contact support!.',
        //     ]);
        // }

        if($service_type === 'data'){

            $plan = DataPlan::findOrFail($provider_id);

            $service_enabled =  $plan->planType->active && $plan->planType->network->data_active;

        }else if($service_type === 'airtime'){

            $provider = MobileNetwork::findOrFail($provider_id);

            $service_enabled =  $provider->airtime_active;

        }else if($service_type === 'cable'){

            $plan = CableSubscriptionPlan::findOrFail($provider_id);

            $service_enabled =  $plan->active && $plan->cableProvider->active;

        }else if($service_type === 'electricity'){

            $provider = ElectricityDistributor::findOrFail($provider_id);

            $service_enabled =  $provider->active;

        }else if($service_type === 'wallet_transfer'){

            $provider = FundingMethod::where('code', $provider_id)->first();

            $service_enabled =  $provider->active;

        }else if($service_type === 'airtime_to_cash_transfer'){

            $provider = FundingMethod::where('code', $provider_id)->first();

            $service_enabled =  $provider->active;

        }


        if (!$service_enabled || !$user->active) {
            throw ValidationException::withMessages([
                'status' => 'Service unavailable!.',
            ]);
        }

    }


    public function getAirtimeDiscount(User $user, $network, $amount_to_pay)
    {

        $network = MobileNetwork::findOrFail($network);

        $addon = $network->addon()->where('user_package_id', $user->user_package_id)->first();

        if (!$addon) {
            return $amount_to_pay;
        }

        $amount = $addon->amount;
        $amount_type = $addon->amount_type;
        $type = $addon->type;

        $discounted_amount = $amount;

        if ($amount_type === 'percentage') {
            $discounted_amount = $amount_to_pay * ($amount / 100);
        }

        if ($type === 'discount') {
            $new_amount = $discounted_amount;
        }
        elseif ($type === 'charge') {
            $new_amount = -$discounted_amount;
        }

        return $new_amount;

    }



    public function generateTransactionRef($type) {
        $timestamp = now()->format('YmdHis'); // Year, Month, Day, Hour, Minute, Second
        $randomNumber = mt_rand(100000, 999999); // Generate a random 6-digit number
        $uniqueRef = $type . $timestamp . $randomNumber;

        return $uniqueRef;
    }





    public function applyFundingCharges($amount, $charges)
    {
        $charge = explode(" ", $charges);

        $totalCharge = 0;

        $chargeType = $charge[1];
        $chargeAmount = floatval($charge[0]);

        if ($chargeType === "%") {
            $totalCharge = round((floatval($amount) * $chargeAmount) / 100);
        } else if ($chargeType === "N") {
            $totalCharge = $chargeAmount;
        }

        return $totalCharge;

    }

    public function getNetworkId(TransactionApi $api, MobileNetwork $network) {
            $networkName = $network->name;

                switch ($networkName) {
                    case 'MTN':
                        return $api->mtn_service_id;
                        break;

                    case 'AIRTEL':
                            return $api->airtel_service_id;
                            break;

                    case 'GLO':
                        return $api->glo_service_id;
                        break;

                    case '9MOBILE':
                        return $api->ninemobile_service_id;
                        break;

                    default:
                        break;
                }


    }


    public function applyMonnifyCharges($amount, $charges)
    {
        $charge = explode(" ", $charges);

        $totalCharge = 0;

        $chargeType = $charge[1];
        $chargeAmount = floatval($charge[0]);

        if ($chargeType === "%") {
            $totalCharge = round((floatval($amount) * $chargeAmount) / 100);
        } else if ($chargeType === "N") {
            $totalCharge = $chargeAmount;
        }

        return $totalCharge;

    }


    public function enforceAccountKyclimit($amount, $accountNumber)
    {

        // Find the account using account number
        // check if the account is temporary
        // comapare limit from config

        // if limit exceed, then update user to restricted


    }




    // public function performTransaction($data) {

    //     $this->helpers->checkServiceActive($user, $data['data_plan_id'], 'data');

    //     $plan = DataPlan::find($data['data_plan_id']);

    //     $this->helpers->validateUserSpendingLimit($user, $plan->useramount);

    //     $description = Str::upper($plan->size."".$plan->volume) ." Data ".$plan->network." to ". $data['phone_number'];


    //     try {
    //         DB::beginTransaction();

    //         $balance = $this->helpers->validateBalanceAndDeductAmount($user->id, $plan->useramount);

    //         $transactionable = DataTransaction::create([
    //             'phone_number' => $data['phone_number'],
    //             'mobile_network_id' => $data['mobile_network'],
    //             'data_plan_id' => $plan->id,
    //         ]);

    //         $transactionData = [
    //             'reference' => $this->helpers->generateTransactionRef('DT'),
    //             'user_id' => $user->id,
    //             'amount' => $plan->useramount,
    //             'description'=>  $description,
    //             'balance_before' => (float)$balance['before'],
    //             'balance_after' => (float)$balance['after'],
    //         ];

    //         if (Schema::hasColumn('transactions', 'request_ip')) {
    //             $transactionData['request_ip'] = $request->ip();
    //         }

    //         $transaction = $transactionable->transaction()->create($transactionData);

    //         DB::commit();

    //         Log::channel('data_transactions')
    //                 ->info('Data Purchased', [
    //                 'email'=> $user->email,
    //                 'ip'=> $request->ip(),
    //                 'amount'=> $plan->amount,
    //                 'plan'=> $plan->name,
    //                 'beneficiary'=> $data['phone_number'],
    //                 'network'=> $data['mobile_network'],
    //                 'balance_before'=>(float)$balance['before'],
    //                 'balance_after'=> (float)$balance['after'],
    //             ]);

    //         return $transaction;

    //     } catch (Exception $e) {
    //         DB::rollBack();

    //         Log::error($e->getMessage());

    //         throw ValidationException::withMessages([
    //             'status' => $e->getMessage() ?? 'Something Went Wrong! Try again later.',
    //         ]);

    //     }

    //     // finally {
    //     //     $lock->release();
    //     // }
    // }





}
