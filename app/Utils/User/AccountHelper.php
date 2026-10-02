<?php

namespace App\Utils\User;

use App\Models\User;
use App\Jobs\CreateVirtualAccount;
use Illuminate\Support\Facades\Log;
use App\Jobs\createBillstackAccount;
use App\Jobs\CreatePaymentPointAccount;
use App\Jobs\CreatePayvesselVirtualAccount;


class AccountHelper
{


    public function generateVirtualAccount(User $user) {
        $hasMonifyAccount = $this->hasAccountWithBankCodes($user, ['232', '035', '50515']);
        $hasPayvesselAccount = $this->hasAccountWithBankCodes($user, ['120001']);
        $hasBillAccount = $this->hasAccountWithBankCodes($user, ['PALMPAY', 'SAFEHAVEN']);
        $hasPaymentPointAccount = $this->hasAccountWithBankCodes($user, ['20946']);

        if (config('settings.payvessel_service') === '1' && !$hasPayvesselAccount) {
            CreatePayvesselVirtualAccount::dispatchSync($user);
        }
        if (config('settings.monnify_service') === '1' && !$hasMonifyAccount) {
            CreateVirtualAccount::dispatchSync($user);
        }
        if (config('settings.BillStack_service') === "1" && !$hasBillAccount) {
            createBillstackAccount::dispatchSync($user, $user->id);
        }
        if (config('settings.paymentPoint_service') === "1" && !$hasPaymentPointAccount) {
            CreatePaymentPointAccount::dispatchSync($user, $user->id);
        }
    }

    public function generateTemporaryAccount(User $user) {
        $hasMonifyAccount = $this->hasAccountWithBankCodes($user, ['232', '035', '50515']);
        $hasPayvesselAccount = $this->hasAccountWithBankCodes($user, ['120001']);

        if (config('settings.payvessel_service') === '1' && !$hasPayvesselAccount) {
            CreatePayvesselVirtualAccount::dispatchSync($user, true);
        }

        if (config('settings.monnify_service') === '1' && !$hasMonifyAccount) {
            CreateVirtualAccount::dispatchSync($user, true);
        }
    }

    private function hasAccountWithBankCodes(User $user, array $bankCodes) {
        return $user->fundingAccounts()->whereIn('bank_code', $bankCodes)->exists();
    }


}
