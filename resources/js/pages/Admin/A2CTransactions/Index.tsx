import React, { memo, useEffect, useState } from "react";
import { router, usePage, Head } from "@inertiajs/react";
import { usePrevious } from "react-use";
import ViewDetailModal from "./components/ViewDetailModal";
import TransactionTable from "./components/TransactionTable";
import TransactionHistoryFilters from "./components/TransactionHistoryFilters";
import AppLayout from "@/layouts/app-layout";
import { Input } from "@/components/ui/input";
import { type BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/admin/dashboard" },
    { title: "A2C Transactions", href: "/admin/a2c-transactions" },
];

function History() {
    const { transactions: data, total_amount, users } = usePage().props as any;

    const [viewDetailModal, setViewDetailModal] = useState({
        show: false,
        id: "",
    });

    const [filterValues, setFilterValue] = useState({
        page: 1,
        pageSize: 20,
        search: "",
        status: "",
        user_id: "",
        from: "",
        to: "",
    });

    const setPaginationModel = (val) => {
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
                : { remember: "forget" };

            router.get(route(route().current()), query, {
                replace: false,
                preserveState: true,
            });
        }
    }, [filterValues]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="A2C Transactions" />
            <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-8">
                <div className="mb-6 space-y-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">A2C Transactions</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Total Amount: ₦{total_amount}
                        </p>
                    </div>
                </div>

                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <TransactionHistoryFilters
                        setFilter={setFilterValue}
                        filters={filterValues}
                        isGenAdmin={true}
                        canViewUsers={true}
                    />

                    <div className="flex gap-2 sm:ml-auto sm:w-auto">
                        <Input
                            placeholder="Filter By Phone Number"
                            value={filterValues.search}
                            onChange={(e) =>
                                setFilterValue({
                                    ...filterValues,
                                    search: e.target.value,
                                })
                            }
                            className="min-w-[200px]"
                        />
                    </div>
                </div>

                <div className="flex py-4">
                    <TransactionTable
                        data={data}
                        setViewDetailModal={setViewDetailModal}
                        paginationModel={{
                            page: filterValues.page - 1,
                            pageSize: filterValues.pageSize,
                        }}
                        setPaginationModel={setPaginationModel}
                    />
                </div>

                <ViewDetailModal
                    viewDetailModal={viewDetailModal}
                    setViewDetailModal={setViewDetailModal}
                />
            </div>
        </AppLayout>
    );
}

export default memo(History);
