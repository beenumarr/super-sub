import { BankIcon } from '@/components/shared/bank-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeftRight, CreditCard, RefreshCw, Wallet } from 'lucide-react';
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

export default function Index() {
    const [formModal, setFormModal] = useState(false);
    const [transferModal, setTransferModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [hasRun, setHasRun] = useState(false);

    const { auth, funding_accounts, methods } = usePage<SharedData>().props as unknown as WalletFundingPageProps;

    const refreshAccounts = () => {
        setProcessing(true);
        router.post(
            '/refresh_funding_accounts',
            { all: true },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Accounts refreshed successfully');
                },
                onError: (errors) => {
                    const message = (errors as unknown as { message?: string }).message || 'An error occurred. Please try again.';
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
                    <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Wallet Management</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Hi {auth.user.name}, manage your wallet balances and funding options here.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={refreshAccounts}
                            disabled={processing}
                            className="inline-flex items-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <BalanceCard label="Main Balance" amount={walletBalance} icon={<Wallet className="h-5 w-5 text-emerald-500" />} />
                        <BalanceCard label="A2C Balance" amount={a2cBalance} icon={<ArrowLeftRight className="h-5 w-5 text-blue-500" />} />
                        <BalanceCard label="Bonus Balance" amount={bonusBalance} icon={<Wallet className="h-5 w-5 text-purple-500" />} />
                    </div>

                    {/* Actions */}
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
                    </div>

                    {/* Funding Accounts */}
                    <div className="space-y-3">
                        <h2 className="text-base font-medium text-gray-900 dark:text-white">Your Funding Accounts</h2>

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
        </AppLayout>
    );
}

interface BalanceCardProps {
    label: string;
    amount: number;
    icon: React.ReactNode;
}

function BalanceCard({ label, amount, icon }: BalanceCardProps) {
    return (
        <Card className="h-full">
            <CardContent className="flex items-center justify-between p-4">
                <div>
                    <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">₦{amount.toLocaleString()}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    {icon}
                </div>
            </CardContent>
        </Card>
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
        <Card className="h-full">
            <CardContent className="flex items-center gap-3 p-4">
                <div className="shrink-0">
                    <BankIcon bank={bankCode} />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{account.bank_name}</p>
                    <p className="mt-1 truncate text-xs text-gray-600 dark:text-gray-300">
                        Name: <span className="font-semibold">{account.account_name}</span>
                    </p>
                    <p className="truncate text-xs text-gray-600 dark:text-gray-300">
                        Account Number: <span className="font-semibold">{account.account_number}</span>
                    </p>
                </div>
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
        <Card className="h-full">
            <button
                type="button"
                onClick={onClick}
                className="flex h-full w-full flex-col items-start gap-2 rounded-lg p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </button>
        </Card>
    );
}
