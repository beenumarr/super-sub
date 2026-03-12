import React, { memo, useEffect, useState, FC } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { usePrevious } from 'react-use';
import ViewDetailModal from './components/ViewDetailModal';
import TransactionTable from './components/TransactionTable';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Transaction {
    id: number;
    reference_id: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        phone?: string;
        email?: string;
    };
    amount: number;
    description: string;
    status: string;
    api_response: string;
    balance_before?: number;
    balance_after?: number;
    provider_name?: string;
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

interface User {
    id: number;
    name: string;
}

interface PageProps extends Record<string, any> {
    auth: any;
    transactions?: TransactionData;
    total_amount?: number;
    users?: User[];
}

interface FilterValues {
    page: number;
    pageSize: number;
    transaction_type: string;
    search: string;
    status: string;
    user_id: string;
    from: string;
    to: string;
}

interface PaginationModel {
    page: number;
    pageSize: number;
}

const transactionTypes = [
    { name: 'All', id: '' },
    { name: 'Data', id: 'DataTransaction' },
    { name: 'Airtime', id: 'AirtimeTransaction' },
    { name: 'Wallet', id: 'WalletTransaction' },
    { name: 'Cable Subscription', id: 'CableSubscriptionTransaction' },
    { name: 'Electricity Bill Payment', id: 'ElectricityBillTransaction' },
];

const ALL_USERS_VALUE = '__all_users__';

interface TransactionTypeData {
    name: string;
    id: string;
}

interface TransactionTypeProps {
    data: TransactionTypeData;
    onChange: (data: TransactionTypeData) => void;
    field_name: string;
    valueSelected: string;
}

const TransactionType: FC<TransactionTypeProps> = ({ data, onChange, field_name, valueSelected }) => {
    return (
        <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
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
    const { transactions, total_amount = 0, users = [] } = usePage<PageProps>().props;

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
        pageSize: 20,
        transaction_type: '',
        search: '',
        status: '',
        user_id: '',
        from: '',
        to: '',
    });

    const setPaginationModel = (val: PaginationModel) => {
        setFilterValue({
            ...filterValues,
            page: Number(val.page) + 1,
            pageSize: val.pageSize,
        });
    };

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

    return (
        <AppLayout>
            <div className="flex flex-col px-3 w-full">
                <div className="mt-2 mb-6 space-y-4">
                    <h1 className="font-medium text-xl">
                        Total Amount: ₦{total_amount}
                    </h1>

                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
                        <Input
                            className="rounded-sm flex-1"
                            placeholder="Filter By Transaction Phone Number"
                            value={filterValues.search}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setFilterValue({
                                    ...filterValues,
                                    search: e.target.value,
                                })
                            }
                        />
                        <Select
                            value={filterValues.user_id ? filterValues.user_id : ALL_USERS_VALUE}
                            onValueChange={(val) =>
                                setFilterValue({
                                    ...filterValues,
                                    user_id: val === ALL_USERS_VALUE ? '' : val,
                                })
                            }
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter By User" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_USERS_VALUE}>All Users</SelectItem>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="my-6 w-full items-center overflow-x-auto text-center justify-start flex gap-2">
                    {transactionTypes.map((type, i) => (
                        <TransactionType
                            key={i}
                            onChange={() =>
                                setFilterValue({
                                    ...filterValues,
                                    transaction_type: type.id,
                                })
                            }
                            valueSelected={filterValues.transaction_type}
                            field_name="transaction_type"
                            data={type}
                        />
                    ))}
                </div>

                <TransactionTable
                    data={data}
                    setViewDetailModal={setViewDetailModal}
                />
            </div>

            <ViewDetailModal
                viewDetailModal={viewDetailModal}
                setViewDetailModal={(v: { show: boolean; id: string | number }) => setViewDetailModal(v)}
            />
        </AppLayout>
    );
};

export default memo(Index);
