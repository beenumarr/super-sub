import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, IdCard, ShieldCheck } from 'lucide-react';

interface KycIndexProps {
    auth: {
        user: {
            name: string;
            kyc_verified_at?: string | null;
        };
    };
    nin_kyc_enabled?: boolean;
    bvn_kyc_enabled?: boolean;
}

export default function Kyc({ auth, nin_kyc_enabled, bvn_kyc_enabled }: KycIndexProps) {
    const isVerified = Boolean(auth.user.kyc_verified_at);

    return (
        <AppLayout breadcrumbs={[{ title: 'KYC', href: '/kyc' }]}>
            <Head title="KYC" />

            <div className="px-4 py-10 lg:px-0">
                <div className="mx-auto flex max-w-xl flex-col items-stretch gap-4">
                    {isVerified ? (
                        <Card className="flex flex-col items-center gap-3 border border-gray-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
                            <CheckCircle2 className="h-12 w-12 text-theme-1" />
                            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                                KYC completed
                            </h1>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                Your account is fully verified.
                            </p>
                            <Link href="/funding" className="mt-1 w-full">
                                <Button className="w-full bg-theme-1 text-white hover:bg-theme-1/90">
                                    Fund wallet
                                </Button>
                            </Link>
                        </Card>
                    ) : (
                        <Card className="border border-gray-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                                Verify your account
                            </h1>
                            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                                Choose one method below to complete your KYC.
                            </p>

                            <div className="mt-4 space-y-3">
                                {bvn_kyc_enabled && (
                                    <KycOptionCard
                                        title="Use BVN"
                                        subtitle="Verify with your BVN."
                                        href={route('kyc.bvn')}
                                        icon={<ShieldCheck className="h-5 w-5" />}
                                    />
                                )}

                                {nin_kyc_enabled && (
                                    <KycOptionCard
                                        title="Use NIN"
                                        subtitle="Verify with your NIN."
                                        href={route('kyc.nin')}
                                        icon={<IdCard className="h-5 w-5" />}
                                    />
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

interface KycOptionCardProps {
    title: string;
    subtitle: string;
    href: string;
    icon: React.ReactNode;
}

function KycOptionCard({ title, subtitle, href, icon }: KycOptionCardProps) {
    return (
        <Link href={href}>
            <Card className="hover:border-theme-1/60 group flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-theme-1/60 dark:hover:bg-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-100">
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
                        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{subtitle}</p>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
