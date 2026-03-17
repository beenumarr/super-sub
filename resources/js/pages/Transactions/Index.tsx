import React, { memo, useEffect, useState, FC } from 'react';
import { router, usePage, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { usePrevious } from 'react-use';
import ViewDetailModal from './components/ViewDetailModal';
import TransactionTable from './components/TransactionTable';
import DateRangeFilter from '@/components/DateRangeFilter';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, FileBarChart } from 'lucide-react';
import { formatToThousands } from '@/utils';

interface Transaction {
    id: number;
    reference: string;
    date: string;
    amount: string | number;
    description: string;
    status: string;
    api_response: string;
    balance_before?: string | number;
    balance_after?: string | number;
    user: {
        id: number;
        name: string;
        phone: string;
    };
    transactionable?: any;
    transactionable_type?: string;
    metadata?: Record<string, any>;
}

interface TransactionData {
    data: Transaction[];
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

interface PageProps extends Record<string, any> {
    transactions?: TransactionData;
}

interface FilterValues {
    page: number;
    transaction_type: string;
    search: string;
    status: string;
    from: string;
    to: string;
}

const transactionTypes = [
    { name: 'All', id: '' },
    { name: 'Data', id: 'DataTransaction' },
    { name: 'Airtime', id: 'AirtimeTransaction' },
    { name: 'Wallet', id: 'WalletTransaction' },
    { name: 'Cable', id: 'CableSubscriptionTransaction' },
    { name: 'Electricity', id: 'ElectricityBillTransaction' },
];

const ALL_STATUS_VALUE = '__all_status__';

interface TransactionTypeProps {
    data: { name: string; id: string };
    onChange: (data: { name: string; id: string }) => void;
    field_name: string;
    valueSelected: string;
}

const TransactionType: FC<TransactionTypeProps> = ({ data, onChange, field_name, valueSelected }) => {
    return (
        <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap">
            <input
                className="cursor-pointer"
                type="radio"
                name={field_name}
                value={data.id}
                id={data.name}
                checked={valueSelected === data.id}
                onChange={() => onChange(data)}
            />
            <span className="text-xs capitalize">{data.name}</span>
        </label>
    );
};

const Index: FC = () => {
    const { transactions } = usePage<PageProps>().props;

    const data: TransactionData = transactions ?? {
        data: [],
        meta: {
            current_page: 1,
            from: 0,
            last_page: 1,
            path: '',
            per_page: 20,
            to: 0,
            total: 0,
        },
        links: {
            first: '',
            last: '',
            prev: null,
            next: null,
        },
    };

    const [viewDetailModal, setViewDetailModal] = useState<{ show: boolean; id: string | number }>(
        {
            show: false,
            id: '',
        }
    );

    const [filterValues, setFilterValue] = useState<FilterValues>({
        page: 1,
        transaction_type: '',
        search: '',
        status: '',
        from: '',
        to: '',
    });

    const prevValues = usePrevious(filterValues);

    useEffect(() => {
        if (prevValues) {
            const query = Object.keys(filterValues).length
                ? filterValues
                : { remember: 'forget' };

            const currentRoute = route().current();
            if (currentRoute) {
                router.get(route(currentRoute), query as any, {
                    replace: false,
                    preserveState: true,
                });
            }
        }
    }, [filterValues]);

    // Calculate statistics
    const successCount = data.data.filter((t) => t.status === 'SUCCESS').length;
    const failedCount = data.data.filter((t) => t.status === 'FAILED').length;
    const pendingCount = data.data.filter((t) => t.status === 'PENDING').length;
    const totalAmount = data.data.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return (
        <AppLayout>
            <Head title="Transaction History" />

            <div className="px-4 py-12 lg:px-0">
                <div className="mx-auto max-w-screen sm:px-6 lg:px-8 space-y-6">
                    {/* Header */}
                    <div className="border-b pb-4">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction History</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            View and manage all your transactions
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">{data.meta.total}</div>
                                    <FileBarChart className="h-5 w-5 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Amount
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">₦{formatToThousands(totalAmount, 2)}</div>
                                    <DollarSign className="h-5 w-5 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Successful
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">{successCount}</div>
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Failed
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">{failedCount}</div>
                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Search */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <Input
                                    placeholder="Search by reference or description..."
                                    value={filterValues.search}
                                    onChange={(e) =>
                                        setFilterValue({
                                            ...filterValues,
                                            search: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select
                                        value={filterValues.status ? filterValues.status : ALL_STATUS_VALUE}
                                        onValueChange={(val) =>
                                            setFilterValue({
                                                ...filterValues,
                                                status: val === ALL_STATUS_VALUE ? '' : val,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={ALL_STATUS_VALUE}>All Status</SelectItem>
                                            <SelectItem value="SUCCESS">Success</SelectItem>
                                            <SelectItem value="PENDING">Pending</SelectItem>
                                            <SelectItem value="FAILED">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Date Range Filter */}
                            <DateRangeFilter
                                from={filterValues.from}
                                to={filterValues.to}
                                onDateChange={(from, to) =>
                                    setFilterValue({
                                        ...filterValues,
                                        from,
                                        to,
                                        page: 1,
                                    })
                                }
                            />

                            {/* Transaction Type Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Transaction Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {transactionTypes.map((type) => (
                                        <TransactionType
                                            key={type.id}
                                            data={type}
                                            onChange={() =>
                                                setFilterValue({
                                                    ...filterValues,
                                                    transaction_type: type.id,
                                                })
                                            }
                                            valueSelected={filterValues.transaction_type}
                                            field_name="transaction_type"
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transactions Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transactions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <TransactionTable
                                data={data}
                                setViewDetailModal={setViewDetailModal}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Transaction Detail Modal */}
            <ViewDetailModal
                viewDetailModal={viewDetailModal}
                setViewDetailModal={(v: { show: boolean; id: string | number }) => setViewDetailModal(v)}
            />
        </AppLayout>
    );
};

export default memo(Index);
