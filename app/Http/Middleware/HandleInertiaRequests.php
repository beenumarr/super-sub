<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\AppConfiguration;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {

        $debug = session('debug') || ($request->user() && $request->user()->hasRole(['Admin', 'Superadmin','Masteradmin']));

        $can = '';
        $isMaster = false;
        $isSuperAdmin = false;
        $isAdmin = false;

        if($request->user()){
            $can = $request->user()->getCanAttribute();
            $request->user()->wallet;
            $request->user()->package;
            $isAdmin = $request->user()->isAdmin;
            $isMaster = $request->user()->hasRole(['Masteradmin']);
            $isSuperAdmin = $request->user()->isSuperAdmin ;
            $fund_wallet = $request->user()->fundedWallet;
            $made_transaction = $request->user()->madeTransactions;
            $kyc_verified = $request->user()->kyc_verified_at && true ?? false;
        }


        return [
            ...parent::share($request),
            'flash' => [
                'success' => fn () => session('success'),
                'error' => fn () => session('error'),
            ],
            'name' => config('app.name'),
            'theme'=> config('settings.site_primary_color'),
            'isStl'=> config('app.enable_standalone_api'),
            'enable_referral'=> config('app.enable_referral'),
            'colors' => [
                'primary' => config('settings.site_primary_color'),
                'secondary' => config('settings.site_secondary_color'),
            ],
            'config'=> [
                'monnify_contract_code'=> config('settings.monnify_contract_code'),
                'monnify_api_key'=> config('settings.monnify_api_key'),
                'monnify_marchant_name'=> config('settings.monnify_marchant_name'),
                'monnify_funding_charges'=> config('settings.monnify_funding_charges'),
                'site_name'=> config('settings.site_name', 'VTU App'),
                'site_logo'=> $this->getSiteLogo(),
                'site_favicon'=> config('settings.site_favicon'),
                'logo_type'=> $this->getLogoType(),
            ],
            'feature_enabled'=> [
                'wallet_transfer'=> (bool) (config('settings.feat_enable_wallet_transfer') == '1'),
                'airtime_to_cash'=> (bool) (config('settings.feat_enable_airtime_to_cash') == '1'),
                'referral'=> (bool) (config('settings.feat_enable_referral') == '1'),
                'email_verification'=> in_array(config('settings.feat_enable_email_verification'), ['1', 1, 'true', true], true),
                'nin_verification' => in_array(config('settings.feat_enable_nin_verification', '1'), ['1', 1, 'true', true], true),
                'bvn_verification' => in_array(config('settings.feat_enable_bvn_verification', '1'), ['1', 1, 'true', true], true),
                'kyc'=> (bool) (
                    in_array(config('settings.feat_enable_kyc'), ['1', 1, 'true', true], true)
                    || (
                        (in_array(config('settings.feat_enable_kyc_bvn'), ['1', 1, 'true', true], true) || in_array(config('settings.feat_enable_kyc_nin'), ['1', 1, 'true', true], true))
                        && !in_array(config('settings.feat_enable_kyc'), ['0', 0, 'false', false], true)
                    )
                ),
            ],
            'auth' => [
                'user' => $request->user(),
                'can' => $can,
                'site_name'=> config('settings.site_name'),
                'site_primary_color'=> config('settings.site_primary_color'),
                'site_secondary_color'=> config('settings.site_secondary_color'),
                'site_contact_number'=> config('settings.site_contact_number'),
                'isAdmin' => $isAdmin,
                'isSuperAdmin' => $isSuperAdmin,
                'isMaster' => $isMaster,
                'funded_wallet' => $fund_wallet ?? false,
                'kyc_verified' => $kyc_verified ?? false,
                'made_transaction' => $made_transaction ?? false,
                'notifications'=> config('settings.site_notification'),
                'is_impersonating' => session()->has('impersonate_original_id'),
            ],
            'is_impersonating' => session()->has('impersonate_original_id'),
            'debug' => $debug,
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Get logo_type directly from database to bypass cache issues
     */
    private function getLogoType(): string
    {
        try {
            // Always check database first to ensure we get the latest value
            $record = AppConfiguration::where('key', 'logo_type')->first();
            if ($record && !empty($record->value)) {
                return $record->value;
            }

            // Fallback to config if somehow the database query fails
            return config('settings.logo_type', 'titled');
        } catch (\Exception $e) {
            return 'titled';
        }
    }

    /**
     * Get site_logo directly from database with fallback
     */
    private function getSiteLogo(): string
    {
        try {
            $record = AppConfiguration::where('key', 'site_logo')->first();
            if ($record && !empty($record->value)) {
                return $record->value;
            }

            return config('settings.site_logo', 'logo-icon.png');
        } catch (\Exception $e) {
            return 'logo-icon.png';
        }
    }
}
