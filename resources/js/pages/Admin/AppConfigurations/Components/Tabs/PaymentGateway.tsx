import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ConfigItem } from '../ConfigItem';

interface PaymentGatewayProps {
    data: Record<string, unknown>;
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setData: (keyOrData: string | Record<string, unknown>, value?: unknown) => void;
    monnify_charges_options?: unknown[];
    enable_payvessel: boolean;
    enable_Bill_Stack: boolean;
    enable_paymentPoint: boolean;
}

const banks = [
    { bankCode: '232', bankName: 'Sterling bank' },
    { bankCode: '035', bankName: 'Wema bank' },
    { bankCode: '50515', bankName: 'Moniepoint Microfinance Bank' },
    { bankCode: '058', bankName: 'GTBank' },
    { bankCode: '120001', bankName: '9 Payment PSB' },
];

const fundingCharges = [
    { name: '1% (percent)', value: '1 %' },
    { name: '1.6% (percent)', value: '1.6 %' },
    { name: '2% (percent)', value: '2 %' },
    { name: 'N50', value: '50 N' },
    { name: 'Settlement Amount', value: 'settlement_amount' },
];

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="pt-3">
            <div className="bg-muted rounded-t-md px-4 py-2">
                <h3 className="text-lg font-medium">{title}</h3>
            </div>
            <div className="space-y-4 rounded-b-md border border-t-0 p-4">{children}</div>
        </div>
    );
}

function ToggleRow({
    label,
    dataKey,
    data,
    setData,
}: {
    label: string;
    dataKey: string;
    data: Record<string, unknown>;
    setData: (keyOrData: string | Record<string, unknown>, value?: unknown) => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <Switch checked={data[dataKey] as boolean} onCheckedChange={(checked) => setData({ ...data, [dataKey]: checked })} />
                <span className="text-muted-foreground text-sm">{(data[dataKey] as boolean) ? 'Enable' : 'Disabled'}</span>
            </div>
        </div>
    );
}

export default function PaymentGateway({
    data,
    handleOnChange,
    setData,
    enable_payvessel,
    enable_Bill_Stack,
    enable_paymentPoint,
}: PaymentGatewayProps) {
    const setDataKey = (key: string, value: unknown) => setData(key, value);

    return (
        <>
            <SectionBlock title="General Setting">
                <div className="space-y-2">
                    <Label>Default Funding Bank</Label>
                    <Select
                        value={(data['default_funding_bank'] as string) || 'none'}
                        onValueChange={(v) => setDataKey('default_funding_bank', v === 'none' ? '' : v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Select</SelectItem>
                            {banks.map((item) => (
                                <SelectItem key={item.bankCode} value={item.bankCode}>
                                    {item.bankName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {(data.feat_enable_temp_account as boolean) && (
                    <>
                        <div className="my-5 border-b py-2 text-base font-medium">Temporary Account</div>
                        <ToggleRow label="Enable Temporary Account" dataKey="temp_account_enable" data={data} setData={setData} />
                        <ConfigItem
                            label="Temporary Account Limit"
                            name="temp_account_limit"
                            value={data['temp_account_limit'] as string}
                            handleOnChange={handleOnChange}
                        />
                        <ConfigItem
                            label="Temporary Account BVN (Encrypted)"
                            name="temp_account_bvn"
                            value={data['temp_account_bvn'] as string}
                            handleOnChange={handleOnChange}
                        />
                        <ConfigItem
                            label="Temporary Account NIN (Encrypted)"
                            name="temp_account_nin"
                            value={data['temp_account_nin'] as string}
                            handleOnChange={handleOnChange}
                        />
                    </>
                )}
            </SectionBlock>

            <SectionBlock title="Monnify">
                <ConfigItem label="API Key" name="monnify_api_key" value={data['monnify_api_key'] as string} handleOnChange={handleOnChange} />
                <ConfigItem
                    label="Secret Key"
                    name="monnify_secret_key"
                    value={data['monnify_secret_key'] as string}
                    handleOnChange={handleOnChange}
                />
                <ConfigItem
                    label="Contract Code"
                    name="monnify_contract_code"
                    value={data['monnify_contract_code'] as string}
                    handleOnChange={handleOnChange}
                />
                <div className="space-y-2">
                    <Label>Funding Charges</Label>
                    <Select
                        value={(data['monnify_funding_charges'] as string) || 'none'}
                        onValueChange={(v) => setDataKey('monnify_funding_charges', v === 'none' ? '' : v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Select</SelectItem>
                            {fundingCharges.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <ToggleRow label="Enable Service" dataKey="monnify_service" data={data} setData={setData} />
            </SectionBlock>

            {enable_payvessel && (
                <SectionBlock title="Payvessel">
                    <ConfigItem
                        label="API URL"
                        name="payvessel_api_url"
                        value={data['payvessel_api_url'] as string}
                        handleOnChange={handleOnChange}
                    />
                    <ConfigItem
                        label="API Key"
                        name="payvessel_api_key"
                        value={data['payvessel_api_key'] as string}
                        handleOnChange={handleOnChange}
                    />
                    <ConfigItem
                        label="Secret Key"
                        name="payvessel_secret_key"
                        value={data['payvessel_secret_key'] as string}
                        handleOnChange={handleOnChange}
                    />
                    <ConfigItem
                        label="Business ID"
                        name="payvessel_business_id"
                        value={data['payvessel_business_id'] as string}
                        handleOnChange={handleOnChange}
                    />
                    <div className="space-y-2">
                        <Label>Funding Charges</Label>
                        <Select
                            value={(data['payvessel_funding_charges'] as string) || 'none'}
                            onValueChange={(v) => setDataKey('payvessel_funding_charges', v === 'none' ? '' : v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Select</SelectItem>
                                {fundingCharges.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <ToggleRow label="Enable Service" dataKey="payvessel_service" data={data} setData={setData} />
                </SectionBlock>
            )}

            {enable_Bill_Stack && (
                <SectionBlock title="Billstack">
                    <ConfigItem
                        label="API Key"
                        name="BillStack_api_key"
                        value={data['BillStack_api_key'] as string}
                        handleOnChange={handleOnChange}
                    />
                    <ConfigItem
                        label="Secret Key"
                        name="BillStack_secret_key"
                        value={data['BillStack_secret_key'] as string}
                        handleOnChange={handleOnChange}
                    />
                    <div className="space-y-2">
                        <Label>Funding Charges</Label>
                        <Select
                            value={(data['BillStack_funding_charges'] as string) || 'none'}
                            onValueChange={(v) => setDataKey('BillStack_funding_charges', v === 'none' ? '' : v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Select</SelectItem>
                                {fundingCharges.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <ToggleRow label="Enable Service" dataKey="BillStack_service" data={data} setData={setData} />
                </SectionBlock>
            )}

            {enable_paymentPoint && (
                <SectionBlock title="paymentPoint">
                    <ConfigItem
                        label="API Key"
                        name="paymentPoint_api_key"
                        value={data['paymentPoint_api_key'] as string}
                        handleOnChange={handleOnChange}
                    />
                    <ConfigItem
                        label="Secret Key"
                        name="paymentPoint_secret_key"
                        value={data['paymentPoint_secret_key'] as string}
                        handleOnChange={handleOnChange}
                    />
                    <ConfigItem
                        label="business id"
                        name="paymentPoint_Business_id"
                        value={data['paymentPoint_Business_id'] as string}
                        handleOnChange={handleOnChange}
                    />
                    <div className="space-y-2">
                        <Label>Funding Charges</Label>
                        <Select
                            value={(data['paymentPoint_funding_charges'] as string) || 'none'}
                            onValueChange={(v) => setDataKey('paymentPoint_funding_charges', v === 'none' ? '' : v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Select</SelectItem>
                                {fundingCharges.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <ToggleRow label="Enable Service" dataKey="paymentPoint_service" data={data} setData={setData} />
                </SectionBlock>
            )}
        </>
    );
}
