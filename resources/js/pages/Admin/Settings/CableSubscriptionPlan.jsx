import React, { useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import AdminAuthenticatedLayout from "@/Layouts/AdminAuthenticatedLayout";
import CableSubscriptionPlanTable from "./Components/CableSubscriptionPlanTable";
import { usePrevious } from "react-use";
import { BgColor, HoverBgColor, TextColor } from "@/utils/theme";

export default function Index(props) {
    const {
        cable_subscription_plans: data,
        cable_networks,
        theme,
    } = usePage().props;

    const [filterValues, setFilterValue] = useState({
        page: 1,
        pageSize: 20,
        network: "",
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
        <AdminAuthenticatedLayout auth={props.auth} title="Settings">
            <div className=" w-full p-2">
                <div className=" border-b py-2 mb-2 w-full items-center overflow-x-auto text-center justify-start flex   ">
                    <Network
                        theme={theme}
                        onChange={() =>
                            setFilterValue({
                                ...filterValues,
                                network: "",
                            })
                        }
                        valueSelected={filterValues.network}
                        field_name="network"
                        data={{ name: "ALL", id: "" }}
                    />
                    {cable_networks.map((type, i) => (
                        <Network
                            key={i}
                            theme={theme}
                            onChange={() =>
                                setFilterValue({
                                    ...filterValues,
                                    network: type.id,
                                })
                            }
                            valueSelected={filterValues.network}
                            field_name="network"
                            data={type}
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
        </AdminAuthenticatedLayout>
    );
}

function Network({ data, onChange, field_name, valueSelected, theme }) {
    return (
        <div>
            <input
                className="hidden"
                type="radio"
                name={field_name}
                value={data}
                id={data.name}
                onChange={() => onChange(data)}
            />
            <label
                htmlFor={data.name}
                className={` ${
                    HoverBgColor[theme]
                } hover:text-theme-1 shadow-sm   border text-center flex cursor-pointer  px-4 py-1  justify-center   ${
                    valueSelected === data.id
                        ? BgColor[theme] + " text-theme-1"
                        : TextColor[theme] + " bg-theme-1"
                } `}
            >
                <span className="text-base capitalize  flex">{data.name}</span>
            </label>
        </div>
    );
}
