import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { formatToThousands } from '@/utils';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PaystackButton } from 'react-paystack';

interface BankAccount {
    id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    logo: string;
}

interface Transaction {
    id: number;
    description: string;
    reference_id: string;
    date: string;
    amount: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
}

interface WalletProps {
    wallet?: {
        balance: number;
        bonus: number;
    };
    fundingAccounts?: BankAccount[];
    publicKey: string;
    transactions: Transaction[];
}

export default function Index({ wallet, publicKey, transactions }: WalletProps) {
    const { auth } = usePage<SharedData>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Wallet',
            href: '/wallet',
        },
    ];

    const [amount, setAmount] = useState<number | null>(null);

    const componentProps = {
        email: auth.user.email,
        amount: Number(amount) * 100,
        metadata: {
            name: auth.user.name,
            phone: auth.user.phone,
            custom_fields: [],
        },
        publicKey: publicKey,
        text: amount ? `Fund ₦${amount}` : 'Fund',
        onSuccess: () => {
            toast.success('Wallet Funded Successfully!');
            router.reload();
        },
        onClose: () => {
            router.reload();
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet" />

            <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Wallet</h1>
                    <p className="text-gray-500">Manage your wallet and funding accounts</p>
                </div>

                {/* Wallet Balance Card */}
                <Card className="bg-accent/40 mb-6">
                    <CardHeader className="text-theme-1 flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                        <Wallet className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between">
                            <div className="mb-2">
                                <div className="text-sm text-gray-500">Available Balance</div>
                                <div className="text-2xl font-bold">₦{formatToThousands(wallet?.balance || 0)}</div>
                            </div>
                            <div className="mb-2">
                                <div className="text-sm text-gray-500">Bonus Balance</div>
                                <div className="text-2xl font-bold">₦{formatToThousands(wallet?.bonus || 0)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-accent/40 mb-6">
                    <CardHeader className="text-theme-1 flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-sm font-medium">Fund Wallet</CardTitle>
                            <p className="text-muted-foreground text-xs">Quickly fund your wallet by entering an amount and using Bank Transfer</p>
                        </div>
                        <Plus className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="amount">Amount (₦)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Enter amount to fund"
                                    value={amount || ''}
                                    max={150000}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (value >= 0 && value <= 150000) {
                                            setAmount(value);
                                        }
                                    }}
                                    className="mt-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                            <PaystackButton
                                className="bg-theme-1 hover:bg-theme-1/90 focus-visible:ring-ring inline-flex h-10 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                {...componentProps}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Accounts Section
                <div className="mb-6">
                    <h2 className="mb-4 text-xl font-semibold">Funding Accounts</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {fundingAccounts.map((account) => (
                            <Card key={account.id} className="bg-accent/40 relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 opacity-20" />
                                <CardHeader className="text-theme-1 flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-2">
                                        {account.logo ? (
                                            <img src={account.logo} alt={account.bank_name} className="h-6 w-6 object-contain" />
                                        ) : (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                                <span className="text-xs font-medium text-blue-600">
                                                    {account.bank_name.substring(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <CardTitle className="text-sm font-medium">{account.bank_name}</CardTitle>
                                    </div>
                                    <Banknote className="h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="text-sm text-gray-500">Account Name</div>
                                            <div className="font-medium">{account.account_name}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Account Number</div>
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">{account.account_number}</div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigator.clipboard.writeText(account.account_number)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div> */}

                {/* Recent Activity */}
                <div className="mt-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Recent Transactions</h2>
                    </div>
                    <Card className="bg-accent/40 mt-4">
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {transactions.map((transaction: Transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between p-4">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <p className="text-sm font-medium">{transaction.description}</p>
                                                <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-medium"> ₦{formatToThousands(transaction.amount)}</p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-medium">Ref: {transaction.id}</p>
                                        </div>

                                        <div className="text-right">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                    transaction.status === 'SUCCESS'
                                                        ? 'bg-green-100 text-green-700'
                                                        : transaction.status === 'FAILED'
                                                          ? 'bg-red-100 text-red-700'
                                                          : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
