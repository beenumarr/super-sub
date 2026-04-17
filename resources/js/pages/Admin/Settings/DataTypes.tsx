import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { memo, useEffect, useState, FC } from "react";
import DataTypeTable from "./Components/DataTypeTable";
import type { DataTypeRow } from "./Components/DataTypeUtils";
import { usePrevious } from "react-use";

interface MobileNetwork {
    id: number;
    name: string;
    plan_types?: any[];
}

interface FilterValues {
    network: number;
}

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    auth: {
        user: AuthUser;
    };
    mobile_networks: MobileNetwork[];
    enable_add_datatype: string;
    data_types: DataTypeRow[];
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Data Types', href: '/admin/data_plan_types' },
];

function isEnabledSetting(value: unknown): boolean {
    if (value === true) return true;
    if (value === false || value === null || value === undefined) return false;
    const normalized = String(value).trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
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

const Index: FC = () => {
    const {
        mobile_networks,
        enable_add_datatype,
        data_types: data,
    } = usePage<PageProps>().props;

    const isAdminUser = Boolean((usePage().props as any)?.auth?.isAdmin);

    const [filterValues, setFilterValue] = useState<FilterValues>({
        network: 1,
    });

    const prevValues = usePrevious(filterValues);

    useEffect(() => {
        if (prevValues) {
            const query = Object.keys(filterValues).length
                ? filterValues
                : { remember: "forget" };

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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Types" />
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-4 flex flex-wrap items-center gap-2 overflow-x-auto border-b pb-4">
                    {mobile_networks.map((type) => (
                        <NetworkFilter
                            key={String(type.id)}
                            data={type}
                            valueSelected={filterValues.network}
                            onChange={() =>
                                setFilterValue({
                                    ...filterValues,
                                    network: type.id,
                                })
                            }
                        />
                    ))}
                </div>
                <DataTypeTable
                    enable_add_datatype={isAdminUser || isEnabledSetting(enable_add_datatype)}
                    filterValues={filterValues}
                    setFilterValue={setFilterValue}
                    data={data}
                    planTypes={
                        mobile_networks.find(
                            (it) => it.id === filterValues.network
                        )?.plan_types ?? []
                    }
                />
            </div>
        </AppLayout>
    );
};

export default memo(Index);
