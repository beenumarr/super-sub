import React, { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import UserTable from "./Components/UserTable";
import { usePrevious } from "react-use";

export default function UserTransactionSummary(props: any) {
    const { data } = usePage().props;

    const [filterValues, setFilterValue] = useState({
        page: 1,
        pageSize: 100,
        package: "",
    });

    const setPaginationModel = (val: any) => {
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
        <div className="w-full p-2">
            <UserTable
                filters={filterValues}
                setFilter={setFilterValue}
                data={data}
                paginationModel={{
                    page: filterValues.page - 1,
                    pageSize: filterValues.pageSize,
                }}
                setPaginationModel={setPaginationModel}
            />
        </div>
    );
}
