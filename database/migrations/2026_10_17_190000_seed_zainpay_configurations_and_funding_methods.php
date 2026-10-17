<?php

use App\Models\AppConfiguration;
use App\Models\FundingMethod;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $configs = [
            [
                'key' => 'zainpay_service',
                'value' => '0',
                'type' => 'text',
            ],
            [
                'key' => 'zainpay_api_url',
                'value' => 'https://api.zainpay.ng',
                'type' => 'text',
            ],
            [
                'key' => 'zainpay_username',
                'value' => '',
                'type' => 'text',
            ],
            [
                'key' => 'zainpay_secret_key',
                'value' => '',
                'type' => 'text',
            ],
            [
                'key' => 'zainpay_zainbox_code',
                'value' => '',
                'type' => 'text',
            ],
            [
                'key' => 'zainpay_bank_type',
                'value' => 'wemaBank',
                'type' => 'text',
            ],
            [
                'key' => 'zainpay_funding_charges',
                'value' => '1.6 %',
                'type' => 'option',
                'options' => [
                    ['name' => '1% (percent)', 'value' => '1 %'],
                    ['name' => '1.6% (percent)', 'value' => '1.6 %'],
                    ['name' => '2% (percent)', 'value' => '2 %'],
                    ['name' => 'N50', 'value' => '50 N'],
                    ['name' => 'Settlement Amount', 'value' => 'settlement_amount'],
                ],
            ],
        ];

        foreach ($configs as $config) {
            $item = AppConfiguration::firstOrCreate(
                ['key' => $config['key']],
                ['value' => $config['value']]
            );

            if ($config['type'] === 'option' && isset($config['options'])) {
                foreach ($config['options'] as $option) {
                    $item->options()->firstOrCreate(['value' => $option['value']], $option);
                }
            }
        }

        $fundingMethods = [
            [
                'name' => 'Fidelity Bank',
                'code' => '070',
                'type' => 'bank',
                'active' => true,
            ],
            [
                'name' => 'FCMB',
                'code' => '214',
                'type' => 'bank',
                'active' => true,
            ],
        ];

        foreach ($fundingMethods as $method) {
            FundingMethod::firstOrCreate(
                ['code' => $method['code']],
                $method
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $keys = [
            'zainpay_service',
            'zainpay_api_url',
            'zainpay_username',
            'zainpay_secret_key',
            'zainpay_zainbox_code',
            'zainpay_bank_type',
            'zainpay_funding_charges',
        ];

        AppConfiguration::whereIn('key', $keys)->delete();
        FundingMethod::whereIn('code', ['070', '214'])->delete();
    }
};
