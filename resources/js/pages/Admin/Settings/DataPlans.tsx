import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { memo, useEffect, useState } from 'react';
import { usePrevious } from 'react-use';
import DataPlanTable from './Components/DataPlanTable';
import type { DataPlanRow } from './Components/DataPlanUtils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Data Plans', href: '/admin/data_plans' },
];

interface MobileNetwork {
    id: string | number;
    name: string;
    plan_types?: { id: string | number; name: string }[];
}

interface PageProps {
    theme?: string;
    mobile_networks: MobileNetwork[];
    data_plans: {
        data: DataPlanRow[];
        meta?: {
            current_page: number;
            from: number;
            last_page: number;
            path: string;
            per_page: number;
            to: number;
            total: number;
            links?: { url: string | null; label: string; active: boolean }[];
        };
        links?: { first: string; last: string; prev: string | null; next: string | null };
    };
    auth: { can?: { create_data_plan?: boolean; edit_data_plan?: boolean; delete_data_plan?: boolean } };
}

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

const Index = memo(function DataPlansIndex() {
    const { theme, mobile_networks, data_plans: data, auth } = usePage().props as unknown as PageProps;
    const can = auth?.can ?? {};

    const [filterValues, setFilterValue] = useState<{ page: number; pageSize: number; network: string | number; planType: string | number; [key: string]: any }>({
        page: 1,
        pageSize: 20,
        network: '',
        planType: '',
    });

    const setPaginationModel = (val: { page: number; pageSize: number }) => {
        setFilterValue({
            ...filterValues,
            page: Number(val.page) + 1,
            pageSize: val.pageSize,
        });
    };

    const prevValues = usePrevious(filterValues);

    useEffect(() => {
        if (prevValues) {
            const query = Object.keys(filterValues).length ? filterValues : { remember: 'forget' };
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
            <Head title="Data Plans" />
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-4 flex flex-wrap items-center gap-2 overflow-x-auto border-b pb-4">
                    <NetworkFilter
                        data={{ name: 'ALL', id: '' }}
                        valueSelected={filterValues.network}
                        onChange={() => setFilterValue({ ...filterValues, network: '' })}
                    />
                    {mobile_networks.map((type) => (
                        <NetworkFilter
                            key={String(type.id)}
                            data={type}
                            valueSelected={filterValues.network}
                            onChange={() => setFilterValue({ ...filterValues, network: type.id })}
                        />
                    ))}
                </div>
                <DataPlanTable
                    filterValues={filterValues}
                    setFilterValue={setFilterValue}
                    data={data}
                    planTypes={
                        mobile_networks.find((it) => String(it.id) === String(filterValues.network))
                            ?.plan_types ?? []
                    }
                    theme={theme}
                    paginationModel={{
                        page: filterValues.page - 1,
                        pageSize: filterValues.pageSize,
                    }}
                    setPaginationModel={setPaginationModel}
                    canCreateDataPlan={can?.create_data_plan ?? false}
                    canEditDataPlan={can?.edit_data_plan ?? false}
                    canDeleteDataPlan={can?.delete_data_plan ?? false}
                />
            </div>
        </AppLayout>
    );
});

export default Index;
