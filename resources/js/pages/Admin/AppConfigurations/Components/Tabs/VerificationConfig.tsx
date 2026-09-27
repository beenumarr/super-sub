import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';
import { ConfigItem } from '../ConfigItem';

interface VerificationConfigProps {
    data: Record<string, any>;
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setData: (keyOrData: string | Record<string, unknown>, value?: unknown) => void;
}

export default function VerificationConfig({
    data,
    handleOnChange,
    setData,
}: VerificationConfigProps) {
    const apiKey = (data['africverify_api_key'] as string) || '';
    const isLive = apiKey.startsWith('live_sk_');
    const isSandbox = apiKey.startsWith('test_sk_');

    const ninEnabled = Boolean(
        data['feat_enable_nin_verification'] === true ||
        data['feat_enable_nin_verification'] === 1 ||
        data['feat_enable_nin_verification'] === '1' ||
        data['feat_enable_nin_verification'] === 'true'
    );

    const bvnEnabled = Boolean(
        data['feat_enable_bvn_verification'] === true ||
        data['feat_enable_bvn_verification'] === 1 ||
        data['feat_enable_bvn_verification'] === '1' ||
        data['feat_enable_bvn_verification'] === 'true'
    );

    return (
        <div className="space-y-6">
            {/* Header Description */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-600/10 p-2 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">AfricVerify Identity Verification</h3>
                        <p className="text-xs text-muted-foreground">
                            Configure lookup fees, service availability, and AfricVerify provider API credentials for NIN &amp; BVN queries.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing / Verification Fees */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Verification Fees (Charges)</CardTitle>
                    <CardDescription>
                        Set the fee deducted from users and API resellers for each verification lookup.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <ConfigItem
                                label="NIN Verification Fee (₦)"
                                name="nin_verification_charge"
                                value={data['nin_verification_charge']}
                                handleOnChange={handleOnChange}
                            />
                            <p className="text-xs text-muted-foreground">
                                Amount debited from wallet per NIN verification request (e.g., 100).
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <ConfigItem
                                label="BVN Verification Fee (₦)"
                                name="bvn_verification_charge"
                                value={data['bvn_verification_charge']}
                                handleOnChange={handleOnChange}
                            />
                            <p className="text-xs text-muted-foreground">
                                Amount debited from wallet per BVN verification request (e.g., 100).
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Service Availability Toggles */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Service Status</CardTitle>
                    <CardDescription>
                        Enable or disable verification services across Web UI and Reseller API.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="toggle-nin" className="text-sm font-medium">
                                National Identity Number (NIN) Verification
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Allow users and API clients to perform live NIN lookups
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="toggle-nin"
                                checked={ninEnabled}
                                onCheckedChange={(checked) => setData('feat_enable_nin_verification', checked ? '1' : '0')}
                            />
                            <span className="w-16 text-right text-xs font-medium text-muted-foreground">
                                {ninEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="toggle-bvn" className="text-sm font-medium">
                                Bank Verification Number (BVN) Verification
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Allow users and API clients to perform live BVN lookups
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="toggle-bvn"
                                checked={bvnEnabled}
                                onCheckedChange={(checked) => setData('feat_enable_bvn_verification', checked ? '1' : '0')}
                            />
                            <span className="w-16 text-right text-xs font-medium text-muted-foreground">
                                {bvnEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Provider API Credentials */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold">AfricVerify API Provider Credentials</CardTitle>
                            <CardDescription>
                                API keys authenticate public verification endpoints at AfricVerify.com.
                            </CardDescription>
                        </div>
                        {isLive ? (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 gap-1 text-xs">
                                <CheckCircle2 className="h-3 w-3" /> Live Production
                            </Badge>
                        ) : isSandbox ? (
                            <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400 gap-1 text-xs">
                                <AlertTriangle className="h-3 w-3" /> Sandbox Mode
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="gap-1 text-xs">
                                <KeyRound className="h-3 w-3" /> Unconfigured
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ConfigItem
                        label="AfricVerify API Key (test_sk_... for Sandbox, live_sk_... for Live)"
                        name="africverify_api_key"
                        value={data['africverify_api_key']}
                        handleOnChange={handleOnChange}
                    />
                    <ConfigItem
                        label="AfricVerify API Base URL"
                        name="africverify_api_url"
                        value={data['africverify_api_url'] || 'https://api.africverify.com/api/v1'}
                        handleOnChange={handleOnChange}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
