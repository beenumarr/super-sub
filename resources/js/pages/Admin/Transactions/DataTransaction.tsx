import { AutoSuggestSelect } from '@/components/shared/auto-suggest-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatToThousands } from '@/utils';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { DollarSign, FileBarChart, Search, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Transaction {
    id: number;
    reference_id: string;
    provider_name: string;
    provider_reference: string | null;
    api_process_duration: number;
    amount: number;
    formatted_amount?: string;
    description: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    status_color: string;
    created_at: string;
    api_response: string;
    type: 'DATA' | 'AIRTIME' | 'WALLET';
    user?: {
        id: number;
        name: string;
        email: string;
    };
    metadata: {
        phone_number?: string;
        beneficiary?: string;
        telco_price?: string;
        plan_category?: string;
        data_plan?: string;
        network?: string;
        size?: number;
        volume?: string;
        validity?: string;
        dispense_channel?: string;
    };
}

interface Stats {
    total_transactions: number;
    total_amount: number;
    success_count: number;
    failed_count: number;
    pending_count: number;
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
    networks: string[];
    stats: Stats;
    filters?: {
        user_id?: string;
        type?: string;
        status?: string;
        search?: string;
        date_filter?: string;
        network?: string;
        dispense_channel?: string;
    };
}

export default function TransactionHistory({ transactions, networks, stats, filters }: TransactionHistoryProps) {
    const [userFilter, setUserFilter] = useState(filters?.user_id || 'all');
    const [typeFilter, setTypeFilter] = useState(filters?.type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [dateFilter, setDateFilter] = useState(filters?.date_filter || 'today');
    const [networkFilter, setNetworkFilter] = useState(filters?.network || 'all');
    const [dispenseChannelFilter, setDispenseChannelFilter] = useState(filters?.dispense_channel || 'all');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const applyFilters = (page = currentPage) => {
        setIsLoading(true);

        const params: Record<string, string> = { page: page.toString() };

        if (searchQuery) {
            params.search = searchQuery;
        }

        if (statusFilter !== 'all') {
            params.status = statusFilter;
        }

        if (userFilter !== 'all') {
            params.user_id = userFilter;
        }

        if (typeFilter !== 'all') {
            params.type = typeFilter;
        }

        if (dateFilter !== 'all') {
            params.date_filter = dateFilter;
        }

        if (networkFilter !== 'all') {
            params.network = networkFilter;
        }

        if (dispenseChannelFilter !== 'all') {
            params.dispense_channel = dispenseChannelFilter;
        }

        router.get(route('admin.data-transactions'), params, {
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

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setUserFilter('all');
        setTypeFilter('all');
        setDateFilter('all');
        setNetworkFilter('all');
        setDispenseChannelFilter('all');
        setCurrentPage(1);

        router.get(
            route('admin.data-transactions'),
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

    return (
        <AppLayout>
            <Head title="Admin - Transaction History" />

            <div className="px-4 py-12 lg:px-0">
                <div className="mx-auto max-w-screen sm:px-6 lg:px-8">
                    <div className="mb-6 border-b pb-4">
                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Transaction History ({transactions.meta.total})</h2>
                        </div>

                        {/* Stats Cards */}
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <div className="bg-accent overflow-hidden rounded-lg p-4 shadow-lg">
                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</dt>
                                <dd className="mt-1 flex items-center text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                    <FileBarChart className="mr-2 h-5 w-5 text-blue-500" />
                                    {stats.total_transactions.toLocaleString()}
                                </dd>
                            </div>

                            <div className="bg-accent overflow-hidden rounded-lg p-4 shadow-lg">
                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</dt>
                                <dd className="mt-1 flex items-center text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                    <DollarSign className="mr-2 h-5 w-5 text-green-500" />₦{formatToThousands(stats.total_amount, 2)}
                                </dd>
                            </div>

                            <div className="bg-accent overflow-hidden rounded-lg p-4 shadow-lg">
                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Successful</dt>
                                <dd className="mt-1 flex items-center text-2xl font-semibold tracking-tight text-green-600">
                                    <TrendingUp className="mr-2 h-5 w-5" />
                                    {stats.success_count.toLocaleString()}
                                </dd>
                            </div>

                            <div className="bg-accent overflow-hidden rounded-lg p-4 shadow-lg">
                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Failed</dt>
                                <dd className="mt-1 flex items-center text-2xl font-semibold tracking-tight text-red-600">
                                    <TrendingDown className="mr-2 h-5 w-5" />
                                    {stats.failed_count.toLocaleString()}
                                </dd>
                            </div>

                            <div className="bg-accent overflow-hidden rounded-lg p-4 shadow-lg">
                                <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Pending</dt>
                                <dd className="mt-1 flex items-center text-2xl font-semibold tracking-tight text-yellow-600">
                                    <Users className="mr-2 h-5 w-5" />
                                    {stats.pending_count.toLocaleString()}
                                </dd>
                            </div>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="bg-accent/40 mb-6 rounded-lg border border-gray-200 p-4 shadow dark:border-gray-700">
                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                            <div className="flex flex-1 flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                                {/* Date Filter */}
                                <div className="w-full sm:w-40">
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

                                {/* Search Input */}
                                <div className="relative mr-auto w-full flex-1 lg:max-w-xs">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search transactions, users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>

                                {/* Transaction Type Filter */}
                                <div className="w-full sm:w-40">
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Transaction Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="DATA">Data</SelectItem>
                                            <SelectItem value="AIRTIME">Airtime</SelectItem>
                                            <SelectItem value="WALLET">Wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status Filter */}
                                <div className="w-full sm:w-40">
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

                                {/* Network Filter */}
                                <div className="w-full sm:w-40">
                                    <Select value={networkFilter} onValueChange={setNetworkFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Filter by Network" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Networks</SelectItem>
                                            {networks.map((network) => (
                                                <SelectItem key={network} value={network}>
                                                    {network}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Dispense Channel Filter */}
                                <div className="w-full sm:w-40">
                                    <Select value={dispenseChannelFilter} onValueChange={setDispenseChannelFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Dispense Channel" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Channels</SelectItem>
                                            <SelectItem value="WALLET">Wallet</SelectItem>
                                            <SelectItem value="SIM">SIM</SelectItem>
                                            <SelectItem value="SMARTCASH_WALLET">Smartcash Wallet</SelectItem>
                                            <SelectItem value="SMARTCASH_AIRTIME">Smartcash Airtime</SelectItem>
                                            <SelectItem value="MOMO">MTN Momo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* User Filter */}
                                <div className="w-full sm:w-60">
                                    <AutoSuggestSelect
                                        value={userFilter}
                                        onValueChange={setUserFilter}
                                        placeholder="Search Users"
                                        searchEndpoint={route('admin.transactions.search-users')}
                                    />
                                </div>

                                {/* Apply Filters Button */}
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

                                {/* Reset Filters Button */}
                                <Button variant="outline" size="sm" onClick={resetFilters} className="whitespace-nowrap" disabled={isLoading}>
                                    Reset Filters
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Card className="bg-accent/40 shadow">
                        <CardContent className="p-6">
                            {transactions.data.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <FileBarChart className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                                    </div>
                                    <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">No Transactions</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {searchQuery ||
                                        statusFilter !== 'all' ||
                                        userFilter !== 'all' ||
                                        typeFilter !== 'all' ||
                                        networkFilter !== 'all' ||
                                        dispenseChannelFilter !== 'all'
                                            ? 'No transactions match your current filters.'
                                            : 'No transactions found.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader className="bg-accent">
                                            <TableRow>
                                                <TableHead>Ref</TableHead>
                                                <TableHead>User</TableHead>
                                                <TableHead>Dispense Channel</TableHead>
                                                <TableHead>Plan/Details</TableHead>
                                                <TableHead>Beneficiary</TableHead>
                                                <TableHead>Network</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>API Response</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.data.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-medium">{transaction.reference_id}</div>
                                                            <div className="text-xs text-gray-400">
                                                                {format(new Date(transaction.created_at), 'mm/dd/yy hh:mm:ss a')}
                                                                {transaction.api_process_duration !== undefined &&
                                                                    transaction.api_process_duration !== null &&
                                                                    (() => {
                                                                        const duration = Number(transaction.api_process_duration);
                                                                        let textColor = 'text-green-600';
                                                                        if (duration > 10) textColor = 'text-red-600';
                                                                        else if (duration > 5) textColor = 'text-yellow-600';
                                                                        return (
                                                                            <>
                                                                                {' '}
                                                                                |{' '}
                                                                                <span className={`${textColor} font-semibold`}>
                                                                                    🕒 {duration.toFixed(1)}s
                                                                                </span>
                                                                            </>
                                                                        );
                                                                    })()}
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-medium">{transaction.user?.name || 'Unknown'}</div>
                                                            <div className="text-xs text-gray-400">{transaction.user?.email || 'No email'}</div>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            {transaction.metadata?.dispense_channel ?? '-'}
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell>
                                                        {transaction.type === 'DATA' && transaction.metadata ? (
                                                            <div className="text-sm">
                                                                <div>{transaction.metadata.data_plan}</div>
                                                                <div className="text-xs text-gray-400">{transaction.metadata.plan_category}</div>
                                                            </div>
                                                        ) : (
                                                            <div className="max-w-[150px] truncate text-sm">{transaction.description}</div>
                                                        )}
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="text-sm">{transaction.metadata?.beneficiary || '-'}</div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {transaction.metadata?.network || transaction.provider_name || '-'}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-medium">₦{formatToThousands(transaction.amount)}</div>
                                                            {transaction.metadata?.telco_price && (
                                                                <div className="text-xs text-gray-400">
                                                                    Telco: ₦{transaction.metadata.telco_price}
                                                                </div>
                                                            )}
                                                        </div>
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
                                                        <div className="max-w-[300px] text-xs text-wrap" title={transaction.api_response}>
                                                            {transaction.api_response || 'No response'}
                                                        </div>
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
        </AppLayout>
    );
}
