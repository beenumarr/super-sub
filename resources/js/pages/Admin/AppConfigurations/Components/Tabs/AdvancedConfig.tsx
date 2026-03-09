import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface AdvancedConfigProps {
    data: Record<string, unknown>;
    setData: (data: Record<string, unknown>) => void;
}

const configItems = [
    { key: 'feat_enable_payvessel', label: 'Payvessel' },
    { key: 'feat_enable_Bill_Stack', label: 'Bill Stack' },
    { key: 'feat_enable_paymentPoint', label: 'PaymentPoint' },
    { key: 'feat_enable_data_type', label: 'Data Type' },
    { key: 'feat_enable_temp_account', label: 'Temporaty Account' },
    { key: 'feat_enable_kyc', label: 'KYC' },
    { key: 'feat_enable_kyc_bvn', label: 'KYC BVN' },
    { key: 'feat_enable_kyc_nin', label: 'KYC NIN' },
    { key: 'feat_enable_add_api', label: 'Enable Add Api' },
    { key: 'feat_enable_wallet_transfer', label: 'Enable Wallet Transfer' },
    { key: 'feat_enable_referral', label: 'Enable Referral' },
    { key: 'feat_enable_airtime_to_cash', label: 'Enable Airtime to Cash' },
];

export default function AdvancedConfig({ data, setData }: AdvancedConfigProps) {
    return (
        <div className="mb-20 pt-3">
            <div className="rounded-t-md bg-muted px-4 py-2">
                <h3 className="text-lg font-medium">Features</h3>
            </div>
            <div className="space-y-4 rounded-b-md border border-t-0 p-4">
                {configItems.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-2">
                        <Label htmlFor={key} className="flex-1">
                            {label}
                        </Label>
                        <div className="flex items-center gap-2">
                            <Switch
                                id={key}
                                checked={Boolean(data[key])}
                                onCheckedChange={(checked) =>
                                    setData({ ...data, [key]: checked })
                                }
                            />
                            <span className="text-sm text-muted-foreground">
                                {Boolean(data[key]) ? 'Enable' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
