<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    |
    | This value is the name of your application, which will be used when the
    | framework needs to place the application's name in a notification or
    | other UI elements where an application name needs to be displayed.
    |
    */

    'name' => env('APP_NAME', 'VTU App'),

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    |
    | This value determines the "environment" your application is currently
    | running in. This may determine how you prefer to configure various
    | services the application utilizes. Set this in your ".env" file.
    |
    */

    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Application Debug Mode
    |--------------------------------------------------------------------------
    |
    | When your application is in debug mode, detailed error messages with
    | stack traces will be shown on every error that occurs within your
    | application. If disabled, a simple generic error page is shown.
    |
    */

    'debug' => (bool) env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    |
    | This URL is used by the console to properly generate URLs when using
    | the Artisan command line tool. You should set this to the root of
    | the application so that it's available within Artisan commands.
    |
    */

    'url' => env('APP_URL', 'https://vtuapp.com.ng'),


    'test_mode' => env('TEST_MODE', false),

    'enable_standalone_api' => env('ENABLE_STANDALONE_API', false),
    'enable_referral' => env('ENABLE_REFERRAL', false),
    'enable_add_api' => env('ENABLE_ADD_API', false),
    'disable_landing_page' => env('DISABLE_LANDING_PAGE', false),
    'custom_landing_page' => env('CUSTOM_LANDING_PAGE', false),
    'enable_referral' => env('ENABLE_REFERRAL', false),
    'enable_kyc' => env('ENABLE_KYC', false),
    'nin_kyc_enabled' => env('NIN_KYC_ENABLE', false),
    'enable_kyc_nin_validation' => env('ENABLE_KYC_NIN_VALIDATION', false),
    'enable_kyc_bvn_validation' => env('ENABLE_KYC_BVN_VALIDATION', false),
    'disable_duplicate2_checker' => env('DISABLE_SDTCHECKER', false),
    'enable_payvessel' => env('ENABLE_PAYVESSEL', false),
    'enable_Bill_Stack' => env('enable_Bill_Stack', false),
    'enable_paymentPoint' => env('enable_paymentPoint', false),
    'enable_Bill_Stack_onsignup' => env('enable_Bill_Stack_onsignup', false),
    'autopilot_api_key' => env('AUTOPILOT_API_KEY'),
    'autopilot_api_url' => env('AUTOPILOT_API_URL'),

    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default timezone for your application, which
    | will be used by the PHP date and date-time functions. The timezone
    | is set to "UTC" by default as it is suitable for most use cases.
    |
    */

    'timezone' => 'Africa/Lagos',

    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    |
    | The application locale determines the default locale that will be used
    | by Laravel's translation / localization methods. This option can be
    | set to any locale for which you plan to have translation strings.
    |
    */

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    |
    | This key is utilized by Laravel's encryption services and should be set
    | to a random, 32 character string to ensure that all encrypted values
    | are secure. You should do this prior to deploying the application.
    |
    */

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode Driver
    |--------------------------------------------------------------------------
    |
    | These configuration options determine the driver used to determine and
    | manage Laravel's "maintenance mode" status. The "cache" driver will
    | allow maintenance mode to be controlled across multiple machines.
    |
    | Supported drivers: "file", "cache"
    |
    */

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Application Specific Settings
    |--------------------------------------------------------------------------
    |
    | Custom settings for the application
    |
    */

    'sme_pin' => env('SME_PIN', '1234'),
    'service_fee' => env('SERVICE_FEE', 10),
    'dg_service_fee' => env('DG_SERVICE_FEE', 1.6),
    'airtime_service_fee'=> env('AIRTIME_SERVICE_FEE', 0.1),
    'test_mode' => env('TEST_MODE', false),
    'phone_number_limit' => env('PHONE_NUMBER_LIMIT', 60000),
    'basic_phone_number_limit' => env('BASIC_PHONE_NUMBER_LIMIT', 100),
    'eligible_user_tier' => env('ELIGIBLE_USER_TIER', 'LEVEL2'),
    'transaction_delay_threshold' => env('TRANSACTION_DELAY_THRESHOLD', 15),

];
