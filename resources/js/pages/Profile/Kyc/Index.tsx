import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, IdCard, ShieldCheck } from 'lucide-react';

interface KycIndexProps {
    auth: {
        user: {
            name: string;
            kyc_verified?: boolean;
        };
    };
    nin_kyc_enabled?: boolean;
    bvn_kyc_enabled?: boolean;
}

export default function Kyc({ auth, nin_kyc_enabled, bvn_kyc_enabled }: KycIndexProps) {
    const isVerified = Boolean(auth.user.kyc_verified);

    return (
        <AppLayout breadcrumbs={[{ title: 'User KYC', href: '/kyc' }]}>
            <Head title="User KYC" />

            <div className="px-4 py-8 lg:px-0">
                <div className="mx-auto max-w-xl rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {isVerified ? (
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Account KYC Verified Successfully!</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Your KYC has been submitted and verified. Thank you for keeping your account up to date.
                            </p>
                        </div>
                    ) : (
                        <>
                            <header className="border-b border-gray-200 pb-3 dark:border-slate-800">
                                <h1 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Funding Bank Accounts Update (KYC)</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Dear customer, in line with recent directives from the Central Bank of Nigeria (CBN), you are required to update
                                    your virtual accounts for funding. Please update your KYC using one of the options below.
                                </p>
                            </header>

                            <div className="mt-6 space-y-4">
                                {bvn_kyc_enabled && (
                                    <KycOptionCard
                                        title="Update KYC with BVN"
                                        subtitle="Use your BVN to complete your KYC verification."
                                        href={route('kyc.bvn')}
                                        icon={<ShieldCheck className="h-6 w-6" />}
                                    />
                                )}

                                {nin_kyc_enabled && (
                                    <KycOptionCard
                                        title="Update KYC with NIN"
                                        subtitle="Use your NIN to complete your KYC verification."
                                        href={route('kyc.nin')}
                                        icon={<IdCard className="h-6 w-6" />}
                                    />
                                )}
                            </div>
                        </>
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
            <Card className="hover:border-theme-1/40 group relative flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500 dark:hover:bg-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-100">
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
