import { BankIcon } from '@/components/shared/bank-icon';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeftRight, Copy, CreditCard, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CardFundingForm from './Components/CardFundingForm';
import AccountTabs from './Components/GenerateAccountTab';
import TransferFundsForm from './Components/TransferFundsForm';

interface WalletFundingPageProps {
    auth: {
        user: {
            name: string;
            wallet?: {
                balance?: number;
                a2c_balance?: number;
                bonus_balance?: number;
            };
        };
    };
    funding_accounts: FundingAccount[];
    methods: {
        card_funding?: boolean;
        manual_funding?: boolean;
    };
}

interface FundingAccount {
    bank_name: string;
    account_name: string;
    account_number: string;
}

const copyAccountNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    toast.success('Account number copied', { duration: 2000 });
};

export default function Index() {
    const [formModal, setFormModal] = useState(false);
    const [transferModal, setTransferModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [hasRun, setHasRun] = useState(false);
    const [redeemOpen, setRedeemOpen] = useState(false);
    const redeemForm = useForm({
        code: '',
    });

    const { auth, funding_accounts, methods } = usePage<SharedData>().props as unknown as WalletFundingPageProps;

    const refreshAccounts = () => {
        setProcessing(true);
        router.post(
            '/refresh_funding_accounts',
            { all: true },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: (page) => {
                    const flashError = (page?.props as any)?.flash?.error;
                    if (flashError) {
                        toast.error(flashError);
                    } else {
                        toast.success('Accounts refreshed successfully');
                    }
                    router.reload({ only: ['auth', 'funding_accounts'] });
                },
                onError: (errors) => {
                    const message = (errors as any)?.error || (errors as any)?.message || (typeof errors === 'string' ? errors : 'An error occurred. Please try again.');
                    toast.error(message);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    useEffect(() => {
        if (funding_accounts.length <= 0 && !hasRun) {
            refreshAccounts();
            setHasRun(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const walletBalance = auth.user.wallet?.balance ?? 0;
    const a2cBalance = auth.user.wallet?.a2c_balance ?? 0;
    const bonusBalance = auth.user.wallet?.bonus_balance ?? 0;

    return (
        <AppLayout breadcrumbs={[{ title: 'Wallet Management', href: '/wallet' }]}>
            <Head title="Wallet Management" />

            <div className="px-4 py-8 lg:px-0">
                <div className="mx-auto max-w-5xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-col items-start justify-between gap-4 border-b pb-2 sm:flex-row sm:items-center">
                        <BalancePill label="Wallet Balance" amount={walletBalance} icon={<Wallet className="h-4 w-4" />} />
                        {/* <BalancePill label="A2C" amount={a2cBalance} icon={<ArrowLeftRight className="h-4 w-4" />} /> */}
                        <BalancePill label="Bonus" amount={bonusBalance} icon={<Wallet className="h-4 w-4" />} />
                    </div>

                    {/* Funding Accounts */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-medium text-gray-900 dark:text-white">Your Funding Accounts</h2>

                        {funding_accounts.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {funding_accounts.map((account, index) => (
                                    <FundingAccountCard key={`${account.account_number}-${index}`} account={account} />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-4">
                                    <AccountTabs />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Actions */}

                    <h2 className="text-sm font-medium text-gray-900 dark:text-white">Other Funding Options</h2>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {methods.card_funding && (
                            <ActionButton
                                label="Card Funding"
                                description="Fund your wallet instantly with your card."
                                icon={<CreditCard className="h-5 w-5" />}
                                onClick={() => setFormModal(true)}
                            />
                        )}

                        {methods.manual_funding && (
                            <ActionButton
                                label="Manual Bank Funding"
                                description="Fund your wallet via bank transfer."
                                icon={<ArrowLeftRight className="h-5 w-5" />}
                                onClick={() => {
                                    // This currently just highlights the funding accounts section.
                                    toast('Use any of your funding accounts below to transfer funds.');
                                }}
                            />
                        )}

                        <ActionButton
                            label="Redeem Promo"
                            description="Enter your promo code and redeem it into your wallet."
                            icon={<Wallet className="h-5 w-5" />}
                            onClick={() => setRedeemOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CardFundingForm setFormModal={setFormModal} formModal={formModal} />
            <TransferFundsForm
                setTransferModal={setTransferModal}
                transferModal={transferModal}
                a2cBalance={a2cBalance}
                walletBalance={walletBalance}
                user={auth.user}
            />
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
                        <DialogDescription>Enter your promo code below. We will verify and redeem it to your wallet if it is valid.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <Label htmlFor="funding-promo-code">Promo Code</Label>
                        <Input
                            id="funding-promo-code"
                            placeholder="e.g. APRILBONUS"
                            value={redeemForm.data.code}
                            onChange={(e) => redeemForm.setData('code', e.target.value.toUpperCase())}
                        />
                        {redeemForm.errors.code && <p className="text-sm text-red-600">{redeemForm.errors.code}</p>}
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
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        toast.success('Promo redeemed successfully');
                                        setRedeemOpen(false);
                                        router.reload({ only: ['auth', 'funding_accounts'] });
                                    },
                                    onError: (errs: Record<string, string | string[]>) => {
                                        const msg = errs?.code ?? Object.values(errs ?? {}).flat().join(', ');
                                        toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Unable to redeem promo');
                                    },
                                });
                            }}
                            className="bg-theme-1 text-primary-foreground rounded-md px-3 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                        >
                            {redeemForm.processing ? 'Verifying...' : 'Verify & Redeem'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </AppLayout>
    );
}

interface BalancePillProps {
    label: string;
    amount: number;
    icon: React.ReactNode;
}

function BalancePill({ label, amount, icon }: BalancePillProps) {
    return (
        <div className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <div className="mr-2 flex items-center gap-2">
                <div className="bg-theme-1/10 text-theme-1 flex h-7 w-7 items-center justify-center rounded-full">{icon}</div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white"> ₦{amount.toLocaleString()}</span>
        </div>
    );
}

interface FundingAccountCardProps {
    account: FundingAccount;
}

function FundingAccountCard({ account }: FundingAccountCardProps) {
    const getBankCodeFromName = (name: string): string => {
        const normalized = name.toLowerCase();
        if (normalized.includes('wema')) return 'WEMA';
        if (normalized.includes('sterling')) return 'STERLING';
        if (normalized.includes('moniepoint')) return 'MONIEPOINT';
        if (normalized.includes('9psb') || normalized.includes('9payment')) return 'NINEPSB';
        if (normalized.includes('palmpay')) return 'PALMPAY';
        return name.toUpperCase();
    };

    const bankCode = getBankCodeFromName(account.bank_name);

    return (
        <Card className="h-full p-0 shadow-none">
            <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-center gap-3">
                    <div className="shrink-0">
                        <BankIcon bank={bankCode} />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {account.bank_name}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-600 dark:text-gray-300">
                            Name:{' '}
                            <span className="font-semibold">{account.account_name}</span>
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => copyAccountNumber(account.account_number)}
                    className="mt-1 inline-flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-left text-xs font-semibold text-gray-900 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 dark:hover:bg-slate-800"
                >
                    <span className="truncate">{account.account_number}</span>
                    <Copy className="ml-2 h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                </button>
            </CardContent>
        </Card>
    );
}

interface ActionButtonProps {
    label: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

function ActionButton({ label, description, icon, onClick }: ActionButtonProps) {
    return (
        <Card className="h-full p-0 shadow-none">
            <button
                type="button"
                onClick={onClick}
                className="flex h-full w-full items-start gap-2 rounded-lg p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                <div className="bg-theme-1/10 text-theme-1 flex h-7 w-7 items-center justify-center rounded-full">{icon}</div>
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </button>
        </Card>
    );
}
