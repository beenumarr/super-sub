import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { memo, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';
import CableSubscriptionPlanTable, {
    type CablePlansResponse,
} from './Components/CableSubscriptionPlanTable';

interface FilterValues {
    page: number;
    pageSize: number;
    network: string;
    [key: string]: any;
}

interface CableNetwork {
    id: string;
    name: string;
}

interface PaginationModel {
    page: number;
    pageSize: number;
}

interface PageProps {
    cable_subscription_plans: CablePlansResponse;
    cable_networks: CableNetwork[];
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Cable Plans', href: '/admin/cable_subscription_plans' },
];

function NetworkFilter({
    data,
    onChange,
    valueSelected,
}: {
    data: { name: string; id: string | number };
    onChange: () => void;
    valueSelected: string | number;
}) {
    const isSelected = valueSelected === data.id;
    return (
        <button
            type="button"
            onClick={onChange}
            className={`flex cursor-pointer justify-center rounded-md border px-4 py-2 text-center text-sm font-medium transition-colors ${
                isSelected
                    ? 'border-theme-1 bg-theme-1 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
            }`}
        >
            <span className="capitalize">{data.name}</span>
        </button>
    );
}

const Index = memo(function CablePlansIndex() {
    const { cable_subscription_plans: data, cable_networks } = usePage<PageProps>().props;

    const [filterValues, setFilterValue] = useState<FilterValues>({
        page: 1,
        pageSize: 20,
        network: "",
    });

    const setPaginationModel = (val: PaginationModel): void => {
        setFilterValue({
            ...filterValues,
            page: Number(val.page) + 1,
            pageSize: val.pageSize,
        });
    };

    const prevValues = usePrevious<FilterValues>(filterValues);

    useEffect(() => {
        if (prevValues) {
            const query = Object.keys(filterValues).length
                ? filterValues
                : { remember: "forget" };

            const currentRoute = route().current();
            if (currentRoute) {
                router.get(route(currentRoute), query, {
                    replace: false,
                    preserveState: true,
                });
            }
        }
    }, [filterValues]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cable Plans" />
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-4 flex flex-wrap items-center gap-2 overflow-x-auto border-b pb-4">
                    <NetworkFilter
                        data={{ name: 'ALL', id: '' }}
                        valueSelected={filterValues.network}
                        onChange={() => setFilterValue({ ...filterValues, network: '' })}
                    />
                    {cable_networks.map((type) => (
                        <NetworkFilter
                            key={String(type.id)}
                            data={type}
                            valueSelected={filterValues.network}
                            onChange={() => setFilterValue({ ...filterValues, network: type.id })}
                        />
                    ))}
                </div>
                <CableSubscriptionPlanTable
                    data={data}
                    paginationModel={{
                        page: filterValues.page - 1,
                        pageSize: filterValues.pageSize,
                    }}
                    setPaginationModel={setPaginationModel}
                />
            </div>
        </AppLayout>
    );
});

export default Index;
