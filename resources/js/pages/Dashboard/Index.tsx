import { SetTransactionPinModal } from '@/components/modals/set-transaction-pin-modal';
import { WelcomeAnnouncementModal } from '@/components/modals/welcome-announcement-modal';
import { NetworkIcon } from '@/components/shared/network-icon';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatToThousands } from '@/utils';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, ChevronRight, Copy, Eye, EyeOff, Headset, History, Phone, Plus, Receipt, Settings2, User, Wallet, Wifi } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface RecentTransaction {
    id: string;
    description: string;
    reference_id: string;
    date: string;
    status: string;
    telco_price: string;
    network: string;
    api_response: string;
}

interface FundingAccount {
    id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
}

interface DashboardProps {
    recent_transactions: RecentTransaction[];
    wallet?: {
        balance: number;
        actual_balance: number;
        outstanding_balance: number;
        today_usage_fee: number;
        bonus_balance: number;
    };
    funding_accounts: FundingAccount[];
    active_promotion?: null | {
        id: number;
        reward_amount: number;
    };
    welcome_announcement?: {
        enabled: boolean;
        show: boolean;
        title: string;
        content: string;
    };
    has_pin: boolean;
}

export default function Index({ recent_transactions, wallet, funding_accounts, welcome_announcement, has_pin, active_promotion, }: DashboardProps) {
    const { auth } = usePage<{
        auth: {
            user: {
                name: string;
                feat_glo_gifting?: boolean;
                feat_airtel_gifting?: boolean;
                feat_mtn_gifting?: boolean;
                feat_mtn_datashare?: boolean;
                feat_momo_airtime?: boolean;
                kyc_verified_at?: string | null;
            };
            isAdmin?: boolean;
            can?: Record<string, boolean>;
        };
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [showWelcomeModal, setShowWelcomeModal] = useState(welcome_announcement?.show ?? false);
    const [hasNewAnnouncement, setHasNewAnnouncement] = useState(welcome_announcement?.enabled ?? false);
    const [redeemOpen, setRedeemOpen] = useState(false);

    const redeemForm = useForm({
        code: '',
    });

    const handleShowAnnouncement = () => {
        setShowWelcomeModal(true);
        setHasNewAnnouncement(false);
    };

    const handleCloseModal = () => {
        setShowWelcomeModal(false);
        setHasNewAnnouncement(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Account number copied', { duration: 2000 });
    };

    const displayBalance = isBalanceVisible ? `₦${formatToThousands(wallet?.balance ?? 0)}` : '••••••';
    const displayBonus = isBalanceVisible ? `₦${formatToThousands(wallet?.bonus_balance ?? 0)}` : '••••••';

    const historyHref = '/transactions?transaction_type=DataTransaction';

    function getStatusColor(status: string) {
        const s = status?.toUpperCase() ?? '';
        if (s === 'SUCCESS' || s === 'COMPLETED') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (s === 'PENDING') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        if (s === 'FAILED' || s === 'ERROR') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }

    function formatDisplayDate(dateStr: string) {
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    console.log('auth.isAdmin', auth.isAdmin);

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
            announcement={
                welcome_announcement
                    ? {
                          enabled: welcome_announcement.enabled,
                          hasNew: hasNewAnnouncement,
                          title: welcome_announcement.title,
                          content: welcome_announcement.content,
                      }
                    : undefined
            }
            onShowAnnouncement={handleShowAnnouncement}
        >
            <Head title="Dashboard" />

            <div className="container mx-auto mt-3 flex max-w-2xl justify-end px-2 pt-3 pb-8 sm:px-4">
                {auth.isAdmin && (
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2 py-1.5 text-sm font-medium text-orange-500 hover:bg-orange-500/20"
                    >
                        <Settings2 className="h-4 w-4 text-orange-500" />
                        Admin Dashboard
                    </Link>
                )}
            </div>
            <div className="container mx-auto max-w-2xl px-2 pt-3 pb-8 sm:px-4">
                {/* Wallet card */}
                <div className="bg-theme-1 mb-2.5 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className="text-primary-foreground/90 text-sm">Wallet Balance</span>
                        <Link
                            href="/funding"
                            className="bg-primary-foreground text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-medium hover:opacity-90"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Fund
                        </Link>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-primary-foreground text-3xl font-bold">{displayBalance}</span>
                        <button
                            type="button"
                            onClick={() => setIsBalanceVisible((v) => !v)}
                            className="text-primary-foreground hover:bg-primary-foreground/10 rounded p-1"
                            aria-label={isBalanceVisible ? 'Hide balance' : 'Show balance'}
                        >
                            {isBalanceVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                    </div>
                    <p className="text-primary-foreground/90 mt-1 text-sm">Bonus: {displayBonus}</p>

                    {active_promotion && (
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white/10 px-3 py-2">
                            <div className="min-w-0">
                                <p className="text-primary-foreground text-sm font-medium">Promo is live</p>
                                <p className="text-primary-foreground/90 text-xs">
                                    Redeem code to get ₦{formatToThousands(active_promotion.reward_amount)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRedeemOpen(true)}
                                className="bg-primary-foreground text-primary shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                            >
                                Redeem
                            </button>
                        </div>
                    )}
                </div>

                <Dialog
                    open={redeemOpen}
                    onOpenChange={(open) => {
                        setRedeemOpen(open);
                        if (!open) redeemForm.reset();
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Redeem Promo Code</DialogTitle>
                            <DialogDescription>Enter your promo code to receive the bonus.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2">
                            <Input
                                placeholder="e.g. APRILBONUS"
                                value={redeemForm.data.code}
                                onChange={(e) => redeemForm.setData('code', e.target.value)}
                            />
                            {redeemForm.errors.code && (
                                <p className="text-sm text-red-600">{redeemForm.errors.code}</p>
                            )}
                        </div>

                        <DialogFooter className="flex gap-2 sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setRedeemOpen(false)}
                                className="bg-muted text-foreground hover:bg-muted/80 rounded-md px-3 py-2 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={redeemForm.processing}
                                onClick={() => {
                                    redeemForm.post(route('promotions.redeem', undefined, false), {
                                        onSuccess: () => {
                                            toast.success(
                                                active_promotion
                                                    ? `Promo redeemed: +₦${formatToThousands(active_promotion.reward_amount)} bonus`
                                                    : 'Promo redeemed'
                                            );
                                            setRedeemOpen(false);
                                            router.reload({ only: ['wallet', 'active_promotion'] });
                                        },
                                        onError: (errs: any) => {
                                            const msg = errs?.code ?? Object.values(errs ?? {}).flat().join(', ');
                                            toast.error(msg || 'Unable to redeem promo');
                                        },
                                    });
                                }}
                                className="bg-theme-1 text-primary-foreground rounded-md px-3 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                            >
                                {redeemForm.processing ? 'Redeeming...' : 'Redeem'}
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* KYC notice */}
                {!auth.user.kyc_verified_at && (
                    <div className="mb-3 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-50">
                        <div className="mt-0.5 shrink-0">
                            <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-300" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">Complete your KYC to keep your account active</p>
                            <p className="mt-1 text-xs text-amber-800 dark:text-amber-100/80">
                                In line with regulatory requirements, you need to complete your KYC to
                                continue using all features and funding options.
                            </p>
                        </div>
                        <Link
                            href="/kyc"
                            className="shrink-0 rounded-md bg-amber-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                        >
                            Update KYC
                        </Link>
                    </div>
                )}

                {/* Funding Accounts */}
                {funding_accounts && funding_accounts.length > 0 && (
                    <>
                        <h3 className="mb-1 px-1 text-sm font-semibold text-gray-800 dark:text-gray-200">Funding Accounts</h3>
                        <div className="scrollbar-hide mb-3 flex gap-2 overflow-x-auto pb-1">
                            {funding_accounts.map((account) => (
                                <div
                                    key={account.id}
                                    className="bg-card min-w-[280px] flex-1 rounded-lg border border-gray-200 p-2.5 dark:border-gray-700"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="bg-theme-1/10 flex h-8 w-8 items-center justify-center rounded-md">
                                            <Wallet className="text-theme-1 h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1 text-sm">
                                            <span className="text-foreground font-semibold">{account.bank_name}</span>
                                            <span className="mx-1.5 text-gray-400">|</span>
                                            <span className="text-muted-foreground truncate">{account.account_name}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(account.account_number)}
                                        className="bg-muted/50 text-foreground hover:bg-muted mt-2 flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm font-semibold"
                                    >
                                        {account.account_number}
                                        <Copy className="text-muted-foreground h-4 w-4 shrink-0" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Services */}
                <h3 className="mb-2 px-1 text-sm font-semibold text-gray-800 dark:text-gray-200">Services</h3>
                <div className="bg-card rounded-xl border border-gray-200 p-2.5 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-0">
                        <ServiceItem icon={Wifi} label="Data" href="/buy_data" />
                        <ServiceItem icon={Phone} label="Airtime" href="/buy_airtime" borderLeft={true} borderRight={true} />
                        <ServiceItem icon={Wallet} label="Fund Wallet" href="/funding" />
                    </div>
                    <div className="my-1 border-t border-gray-200 dark:border-gray-600" />
                    <div className="grid grid-cols-3 gap-0">
                        <ServiceItem icon={Headset} label="Support" href="mailto:support@vtuapp.com.ng" external />
                        <ServiceItem icon={History} label="History" href={historyHref} borderLeft={true} borderRight={true} />
                        <ServiceItem icon={User} label="Profile" href="/user-settings/profile" />
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="mt-4 flex items-center justify-between px-1">
                    <h3 className="text-foreground text-sm font-medium">Recent Transactions</h3>
                    <Link href={historyHref} className="text-foreground inline-flex items-center gap-0.5 text-sm font-medium hover:underline">
                        View All
                        <ChevronRight className="h-5 w-5" />
                    </Link>
                </div>

                {recent_transactions.length === 0 ? (
                    <div className="bg-card mt-2 flex flex-col items-center justify-center rounded-lg border border-gray-200 py-10 dark:border-gray-700">
                        <div className="bg-muted/50 rounded-full p-5">
                            <Receipt className="text-muted-foreground h-12 w-12" />
                        </div>
                        <p className="text-foreground mt-5 text-lg font-semibold">No recent activity</p>
                        <p className="text-muted-foreground mt-2 max-w-xs text-center text-sm">
                            Your transaction history will appear here once you start using our services
                        </p>
                    </div>
                ) : (
                    <div className="mt-2 space-y-1.5">
                        {recent_transactions.map((tx) => (
                            <div key={tx.id} className="bg-card flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                                <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
                                    {tx.network && tx.network !== 'Unknown' ? (
                                        <NetworkIcon network={tx.network.toUpperCase()} />
                                    ) : (
                                        <Receipt className="text-primary h-4 w-4" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-foreground truncate text-sm font-semibold">{tx.description}</p>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                        <span className="text-muted-foreground truncate text-xs">
                                            {tx.network && tx.network !== 'Unknown' ? tx.network : 'Wallet'}
                                        </span>
                                        <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold ${getStatusColor(tx.status)}`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-foreground text-sm font-bold">₦{formatToThousands(tx.telco_price)}</p>
                                    <p className="text-muted-foreground text-[10px]">{formatDisplayDate(tx.date)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {welcome_announcement && (
                <WelcomeAnnouncementModal
                    isOpen={showWelcomeModal}
                    onClose={handleCloseModal}
                    title={welcome_announcement.title || 'Welcome!'}
                    content={welcome_announcement.content || ''}
                    showOnce={true}
                />
            )}

            <SetTransactionPinModal open={!has_pin} />
        </AppLayout>
    );
}

function ServiceItem({
    icon: Icon,
    label,
    href,
    external,
    borderLeft,
    borderRight,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    href: string;
    external?: boolean;
    borderLeft?: boolean;
    borderRight?: boolean;
}) {
    // Use boolean borderLeft and borderRight, default to false
    const borderLeftClass = borderLeft ? 'border-l border-gray-200 dark:border-gray-600' : '';
    const borderRightClass = borderRight ? 'border-r border-gray-200 dark:border-gray-600' : '';
    const borderClasses = [borderLeftClass, borderRightClass].join(' ');

    const content = (
        <div className={`flex flex-col items-center justify-center py-2 ${borderClasses}`}>
            <div className="bg-theme-1/10 flex h-11 w-11 items-center justify-center rounded-full">
                <Icon className="text-theme-1 h-6 w-6" />
            </div>
            <span className="text-foreground mt-1 text-center text-xs font-medium">{label}</span>
        </div>
    );
    if (external) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="block transition-opacity hover:opacity-80">
                {content}
            </a>
        );
    }
    return (
        <Link href={href} className="block transition-opacity hover:opacity-80">
            {content}
        </Link>
    );
}
