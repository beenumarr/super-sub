import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Filter, Plus, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserSearchSelect } from '@/components/shared/user-search-select';

interface WalletFundingUser {
    id?: number;
    name?: string;
    phone?: string | null;
}

interface WalletFundingRow {
    id: number;
    reference?: string;
    reference_id?: string;
    user?: WalletFundingUser | null;
    funded_by?: WalletFundingUser | null;
    amount: string;
    balance_before: string;
    balance_after: string;
    api_response: string;
    description: string;
    status: string;
    type?: string;
    ledger_type?: string;
    date: string;
}

interface WalletFundingProps {
    transactions: {
        data: WalletFundingRow[];
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
    total_amount: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Wallet Funding', href: '/admin/manual-funding' },
];

export default function WalletFundingIndex({ transactions, total_amount }: WalletFundingProps) {
    const [filterOpen, setFilterOpen] = useState(false);
    const [fundModalOpen, setFundModalOpen] = useState(false);

    const filterForm = useForm({
        from: '',
        to: '',
        transaction_type: '',
        method: 'manual-funding',
        search: '',
        user_id: '',
        status: '',
    });

    const fundingForm = useForm({
        user_id: '',
        amount: '',
        type: 'credit' as 'credit' | 'debit',
        wallet_type: 'balance' as 'balance' | 'a2c_balance',
    });

    const applyFilters = () => {
        filterForm.get(route('admin.manual-funding'), {
            preserveState: true,
            replace: true,
        });
        setFilterOpen(false);
    };

    const clearFilters = () => {
        filterForm.setData({
            from: '',
            to: '',
            transaction_type: '',
            method: 'manual-funding',
            search: '',
            user_id: '',
            status: '',
        });
        router.get(route('admin.manual-funding'), {}, { preserveState: true, replace: true });
        setFilterOpen(false);
    };

    const submitFunding = (e: React.FormEvent) => {
        e.preventDefault();
        fundingForm.post(route('manual-funding.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Wallet updated successfully');
                setFundModalOpen(false);
                fundingForm.reset();
                router.reload();
            },
            onError: () => {
                toast.error('Failed to update wallet');
            },
        });
    };

    const getStatusVariant = (status: string) => {
        if (status === 'success' || status === 'SUCCESS') {
            return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
        }
        if (status === 'pending' || status === 'PENDING') {
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
        }
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet Funding" />

            <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Wallet Funding</h1>
                        <p className="text-sm text-gray-500">
                            Manually credit or debit user wallets and review recent wallet funding transactions.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)}>
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                setFundModalOpen(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Fund / Debit
                        </Button>
                    </div>
                </div>

                <Card className="bg-accent/40 shadow">
                    <CardContent className="space-y-4 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Total Manual Funding:</span> ₦{total_amount}
                            </div>
                        </div>

                        {transactions.data.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-500">No wallet funding transactions found.</div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Funded By</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Balance Before</TableHead>
                                            <TableHead>Balance After</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Description</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{row.reference || row.reference_id || `#${row.id}`}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {row.date ? row.date : ''}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{row.user?.name ?? 'Unknown User'}</span>
                                                        <span className="text-xs text-gray-500">{row.user?.phone ?? 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{row.funded_by?.name ?? 'System'}</span>
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {row.type || row.ledger_type || 'credit'}
                                                </TableCell>
                                                <TableCell>₦{row.amount}</TableCell>
                                                <TableCell>₦{row.balance_before}</TableCell>
                                                <TableCell>₦{row.balance_after}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusVariant(row.status)}>{row.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs truncate text-sm" title={row.api_response || row.description}>
                                                        {row.api_response || row.description}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {transactions.meta.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-gray-500">
                                        <div>
                                            Showing <span className="font-medium">{transactions.meta.from}</span> to{' '}
                                            <span className="font-medium">{transactions.meta.to}</span> of{' '}
                                            <span className="font-medium">{transactions.meta.total}</span> entries
                                        </div>
                                        <div className="flex gap-2">
                                            {transactions.links.prev ? (
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={transactions.links.prev}>Previous</a>
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm" disabled>
                                                    Previous
                                                </Button>
                                            )}
                                            {transactions.links.next ? (
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={transactions.links.next}>Next</a>
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm" disabled>
                                                    Next
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Filters dialog */}
            <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Filter Wallet Funding</DialogTitle>
                        <DialogDescription className="sr-only">Filter transactions by criteria</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="w-1/2 space-y-1">
                                <Label htmlFor="from">From</Label>
                                <Input
                                    id="from"
                                    type="date"
                                    value={filterForm.data.from}
                                    onChange={(e) => filterForm.setData('from', e.target.value)}
                                />
                            </div>
                            <div className="w-1/2 space-y-1">
                                <Label htmlFor="to">To</Label>
                                <Input
                                    id="to"
                                    type="date"
                                    value={filterForm.data.to}
                                    onChange={(e) => filterForm.setData('to', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="search">Search reference or description</Label>
                            <Input
                                id="search"
                                value={filterForm.data.search}
                                onChange={(e) => filterForm.setData('search', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Filter by User (optional)</Label>
                            <UserSearchSelect
                                value={filterForm.data.user_id}
                                onValueChange={(userId) => filterForm.setData('user_id', userId)}
                                placeholder="All users or search to filter..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Method</Label>
                            <Select
                                value={filterForm.data.method}
                                onValueChange={(value) => filterForm.setData('method', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual-funding">Manual Funding</SelectItem>
                                    <SelectItem value="monnify">Monnify Transactions</SelectItem>
                                    <SelectItem value="wallet-transfer">Wallet Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Type</Label>
                            <Select
                                value={filterForm.data.transaction_type}
                                onValueChange={(value) => filterForm.setData('transaction_type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    <SelectItem value="credit">Credit</SelectItem>
                                    <SelectItem value="debit">Debit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="mt-4 flex gap-2">
                        <Button variant="outline" onClick={clearFilters}>
                            Clear
                        </Button>
                        <Button onClick={applyFilters}>
                            Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Fund / Debit dialog */}
            <Dialog open={fundModalOpen} onOpenChange={setFundModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Fund / Debit User Wallet</DialogTitle>
                        <DialogDescription className="sr-only">Fund or debit a user wallet balance</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitFunding} className="space-y-3">
                        <div className="space-y-1">
                            <Label>Select User</Label>
                            <UserSearchSelect
                                value={fundingForm.data.user_id}
                                onValueChange={(userId) => fundingForm.setData('user_id', userId)}
                                placeholder="Search & select user (name, email, phone, ID)..."
                                error={fundingForm.errors.user_id}
                            />
                            {fundingForm.errors.user_id && (
                                <p className="text-xs text-red-500">{fundingForm.errors.user_id}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="amount">Amount (₦)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={fundingForm.data.amount}
                                onChange={(e) => fundingForm.setData('amount', e.target.value)}
                            />
                            {fundingForm.errors.amount && (
                                <p className="text-xs text-red-500">{fundingForm.errors.amount}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label>Type</Label>
                            <Select
                                value={fundingForm.data.type}
                                onValueChange={(value) =>
                                    fundingForm.setData('type', value as 'credit' | 'debit')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit">Credit</SelectItem>
                                    <SelectItem value="debit">Debit</SelectItem>
                                </SelectContent>
                            </Select>
                            {fundingForm.errors.type && (
                                <p className="text-xs text-red-500">{fundingForm.errors.type}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label>Wallet Type</Label>
                            <Select
                                value={fundingForm.data.wallet_type}
                                onValueChange={(value) =>
                                    fundingForm.setData('wallet_type', value as 'balance' | 'a2c_balance')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="balance">Main Wallet</SelectItem>
                                    <SelectItem value="a2c_balance">Airtime-to-Cash Wallet</SelectItem>
                                </SelectContent>
                            </Select>
                            {fundingForm.errors.wallet_type && (
                                <p className="text-xs text-red-500">{fundingForm.errors.wallet_type}</p>
                            )}
                        </div>
                        <DialogFooter className="mt-4 flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFundModalOpen(false)}
                                disabled={fundingForm.processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={fundingForm.processing}>
                                {fundingForm.processing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                Submit
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

