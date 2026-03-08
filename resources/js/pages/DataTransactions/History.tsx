import { AutoSuggestSelect } from '@/components/shared/auto-suggest-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { convetToGB, formatToThousands } from '@/utils';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowRight, FileBarChart, Search } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Transaction {
    id: number;
    reference_id: string;
    provider_name: string;
    provider_reference: string | null;
    amount: number;
    formatted_amount?: string;
    description: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    status_color: string;
    created_at: string;
    api_response: string;
    webhook_details?: {
        webhook_sent: boolean;
        webhook_sent_at: string | null;
        webhook_sent_at_human: string | null;
        webhook_retry_count: number;
        webhook_last_attempt_at: string | null;
        webhook_last_attempt_at_human: string | null;
        webhook_response_body: string | null;
        webhook_status: 'sent' | 'failed' | 'pending';
    };
    metadata: {
        phone_number: string;
        beneficiary: string;
        telco_price: string;
        plan_category: string;
        data_plan: string;
        network: string;
        size: number;
        volume: string;
        validity: string;
    };
}

interface TransactionHistoryProps {
    transactions: {
        data: Transaction[];
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
    type: string;
    total_amount: number;
    total_volume: number;
    debug: boolean;
}

export default function TransactionHistory({ transactions, type, total_amount, total_volume, debug }: TransactionHistoryProps) {
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumberFilter, setPhoneNumberFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const applyFilters = (page = currentPage) => {
        setIsLoading(true);

        const params: Record<string, string> = { page: page.toString() };

        if (searchQuery) {
            params.search = searchQuery;
        }

        if (statusFilter !== 'all') {
            params.status = statusFilter;
        }

        if (phoneNumberFilter !== 'all') {
            params.phone_number_id = phoneNumberFilter;
        }

        if (dateFilter !== 'all') {
            params.date_filter = dateFilter;
        }

        router.get(route('data-transactions.history', { type: type }), params, {
            preserveState: true,
            replace: true,
            onSuccess: () => {
                setIsLoading(false);
                setCurrentPage(page);
            },
            onError: () => {
                setIsLoading(false);
                toast.error('Failed to apply filters');
            },
        });
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCurrentPage(1);
        setPhoneNumberFilter('all');
        setDateFilter('all');

        // Navigate back to the base URL without query params
        router.get(
            route('data-transactions.history', { type: type }),
            { page: '1' },
            {
                preserveState: true,
                replace: true,
                onSuccess: () => {
                    setIsLoading(false);
                },
            },
        );
    };

    const openTransactionModal = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTransaction(null);
    };

    return (
        <AppLayout>
            <Head title="Data Transaction History" />

            <div className="py-2 sm:py-6 lg:px-0">
                <div className="mx-auto max-w-screen px-2 sm:px-6 lg:px-8">
                    <div className="mb-4 border-b pb-3 sm:mb-6 sm:pb-4">
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            {/* Total Count Card */}
                            <div className="bg-accent overflow-hidden rounded-lg p-2 shadow sm:p-4">
                                <dt className="truncate text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">Transactions</dt>
                                <dd className="mt-0.5 text-base font-semibold tracking-tight text-gray-900 sm:mt-1 sm:text-2xl dark:text-white">
                                    {transactions.meta.total}
                                </dd>
                            </div>

                            {/* Total Amount Card */}
                            <div className="bg-accent overflow-hidden rounded-lg p-2 shadow sm:p-4">
                                <dt className="truncate text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">Amount</dt>
                                <dd className="mt-0.5 text-base font-semibold tracking-tight text-gray-900 sm:mt-1 sm:text-2xl dark:text-white">
                                    ₦{formatToThousands(total_amount, 2)}
                                </dd>
                            </div>

                            {/* Total Volume Card */}
                            <div className="bg-accent overflow-hidden rounded-lg p-2 shadow sm:p-4">
                                <dt className="truncate text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">Volume</dt>
                                <dd className="mt-0.5 text-base font-semibold tracking-tight text-gray-900 sm:mt-1 sm:text-2xl dark:text-white">
                                    {convetToGB(total_volume)} GB
                                </dd>
                            </div>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="mb-4">
                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                            <div className="flex flex-1 flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                                {/* Combine Date Range & Status Filter in a single row on mobile and desktop */}
                                <div className="flex w-full flex-row gap-2">
                                    {/* Date Range Filter */}
                                    <div className="w-1/2 sm:w-40">
                                        <Select value={dateFilter} onValueChange={setDateFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by date" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Dates</SelectItem>
                                                <SelectItem value="today">Today</SelectItem>
                                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                                <SelectItem value="this_week">This Week</SelectItem>
                                                <SelectItem value="this_month">This Month</SelectItem>
                                                <SelectItem value="last_month">Last Month</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {/* Status Filter */}
                                    <div className="w-1/2 sm:w-40">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="SUCCESS">Success</SelectItem>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="FAILED">Failed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Combine search and phone filter on one row for mobile */}
                                <div className="flex flex-row gap-2 sm:w-full">
                                    {/* Search Input */}
                                    <div className="relative flex w-full sm:flex-1">
                                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                        <Input
                                            placeholder="Search transaction phone number"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                    {/* Phone Number Filter */}
                                    <div className="w-full flex-1">
                                        <AutoSuggestSelect
                                            value={phoneNumberFilter}
                                            onValueChange={setPhoneNumberFilter}
                                            placeholder="Search Sim Cards"
                                            searchEndpoint={route('phone-numbers.search')}
                                        />
                                    </div>
                                </div>

                                {/* Apply & Reset Filters Buttons in a single row even on mobile */}
                                <div className="flex w-full flex-row justify-end gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setCurrentPage(1);
                                            applyFilters(1);
                                        }}
                                        className="bg-theme-1 hover:bg-theme-1/90 whitespace-nowrap text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Loading...' : 'Apply Filters'}
                                    </Button>

                                    <Button variant="outline" size="sm" onClick={resetFilters} className="whitespace-nowrap" disabled={isLoading}>
                                        Reset Filters
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Card className="bg-accent/40 rounded-none p-0 shadow">
                        <CardContent className="rounded-none p-0">
                            {transactions.data.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <FileBarChart className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                                    </div>
                                    <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">No Transactions</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You haven't made any data transactions yet.</p>
                                    <div className="mt-6">
                                        <Link href={route('data-transactions.index')}>
                                            <Button variant="secondary" className="bg-theme-1 hover:bg-theme-1/90 text-white">
                                                Buy Data
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader className="bg-accent">
                                            <TableRow>
                                                <TableHead>Ref</TableHead>
                                                <TableHead>Plan</TableHead>
                                                <TableHead>Beneficiary</TableHead>
                                                {/* <TableHead>Network</TableHead> */}
                                                <TableHead>Channel</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>API Response</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.data.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <button
                                                                onClick={() => openTransactionModal(transaction)}
                                                                className="cursor-pointer text-left text-blue-600 hover:text-blue-800 hover:underline"
                                                            >
                                                                {transaction.reference_id}
                                                            </button>
                                                            <div className="text-sm text-gray-400">
                                                                {format(new Date(transaction.created_at), 'MMM dd, yyyy hh:mm a')}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            {transaction.metadata.data_plan} | {transaction.metadata.plan_category}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>{transaction.metadata.beneficiary}</TableCell>
                                                    {/* <TableCell>{transaction.metadata.network}</TableCell> */}

                                                    <TableCell>
                                                        {transaction.provider_name}|{transaction.metadata.phone_number}
                                                    </TableCell>

                                                    <TableCell>
                                                        Price: {transaction.amount} | Telco Price: {transaction.metadata.telco_price}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                transaction.status === 'SUCCESS'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                                    : transaction.status === 'PENDING'
                                                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                                                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                            }
                                                        >
                                                            {transaction.status}
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="max-w-[400px] text-wrap" title={transaction.api_response}>
                                                            {transaction.api_response}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openTransactionModal(transaction)}
                                                            className="h-8 px-3 text-xs"
                                                        >
                                                            View Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    <Pagination
                                        meta={transactions.meta}
                                        links={transactions.links}
                                        onPageChange={applyFilters}
                                        isLoading={isLoading}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Transaction Detail Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                    </DialogHeader>

                    {selectedTransaction && (
                        <div className="space-y-6">
                            {/* Transaction Info */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Reference ID:</span>
                                        <div className="text-gray-600">{selectedTransaction.reference_id}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Status:</span>
                                        <div>
                                            <Badge
                                                className={
                                                    selectedTransaction.status === 'SUCCESS'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                        : selectedTransaction.status === 'PENDING'
                                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                }
                                            >
                                                {selectedTransaction.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="font-medium">Created:</span>
                                        <div className="text-gray-600">
                                            {format(new Date(selectedTransaction.created_at), 'MMM dd, yyyy hh:mm a')}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Provider Reference:</span>
                                        <div className="text-gray-600">{selectedTransaction.provider_reference || 'N/A'}</div>
                                    </div>

                                    <div>
                                        <span className="font-medium">Sponsor SIM:</span>
                                        <div className="text-gray-600">{selectedTransaction.metadata.phone_number}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Beneficiary:</span>
                                        <div className="text-gray-600">{selectedTransaction.metadata.beneficiary}</div>
                                    </div>
                                </div>

                                {/* API Response */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">API Response</h3>
                                    <div className="bg-accent max-h-32 overflow-y-auto rounded p-3 font-mono text-sm break-all text-gray-600">
                                        {selectedTransaction.api_response}
                                    </div>
                                </div>
                            </div>

                            {/* Plan Details */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Plan:</span>
                                        <div className="text-gray-600">
                                            {selectedTransaction.metadata.size}MB ₦{selectedTransaction.metadata.telco_price}{' '}
                                            {selectedTransaction.metadata.plan_category}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Network:</span>
                                        <div className="text-gray-600">{selectedTransaction.metadata.network}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Validity:</span>
                                        <div className="text-gray-600">{selectedTransaction.metadata.validity}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium">Data Plan:</span>
                                        <div className="text-gray-600">{selectedTransaction.metadata.data_plan}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Beneficiary Details */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm"></div>
                            </div>

                            {/* Webhook Details */}
                            {debug && selectedTransaction.webhook_details && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Webhook Details</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Status:</span>
                                            <div>
                                                <Badge
                                                    className={
                                                        selectedTransaction.webhook_details.webhook_status === 'sent'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                            : selectedTransaction.webhook_details.webhook_status === 'failed'
                                                              ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                                    }
                                                >
                                                    {selectedTransaction.webhook_details.webhook_status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium">Retry Count:</span>
                                            <div className="text-gray-600">{selectedTransaction.webhook_details.webhook_retry_count}</div>
                                        </div>
                                        {selectedTransaction.webhook_details.webhook_sent_at && (
                                            <div>
                                                <span className="font-medium">Sent At:</span>
                                                <div className="text-gray-600">{selectedTransaction.webhook_details.webhook_sent_at}</div>
                                            </div>
                                        )}
                                        {selectedTransaction.webhook_details.webhook_last_attempt_at && (
                                            <div>
                                                <span className="font-medium">Last Attempt:</span>
                                                <div className="text-gray-600">{selectedTransaction.webhook_details.webhook_last_attempt_at}</div>
                                            </div>
                                        )}
                                    </div>
                                    {selectedTransaction.webhook_details.webhook_response_body && (
                                        <div>
                                            <span className="font-medium">Response Body:</span>
                                            <div className="bg-accent mt-1 rounded p-2 font-mono text-xs break-all text-gray-600">
                                                {selectedTransaction.webhook_details.webhook_response_body}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
