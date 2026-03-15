import React, { memo, useEffect, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import AdminAuthenticatedLayout from "@/Layouts/AdminAuthenticatedLayout";
import DataTypeTable from "./Components/DataTypeTable";
import { usePrevious } from "react-use";
import { BgColor, HoverBgColor, TextColor } from "@/utils/theme";

const Index = (props) => {
    const {
        theme,
        mobile_networks,
        enable_add_datatype,
        data_types: data,
    } = usePage().props;

    const [filterValues, setFilterValue] = useState({
        network: 1,
    });

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
        <AdminAuthenticatedLayout auth={props.auth} title="Data Plans">
            <div className=" w-full p-2">
                <div className=" border-b py-2 mb-2 w-full items-center overflow-x-auto text-center justify-start flex   ">
                    {mobile_networks.map((type, i) => (
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
                <DataTypeTable
                    enable_add_datatype={enable_add_datatype === "1"}
                    filterValues={filterValues}
                    setFilterValue={setFilterValue}
                    data={data}
                    planTypes={
                        mobile_networks.find(
                            (it) => it.id === filterValues.network
                        )?.plan_types ?? []
                    }
                    theme={theme}
                    // paginationModel={{
                    //     page: filterValues.page - 1,
                    //     pageSize: filterValues.pageSize,
                    // }}
                    // setPaginationModel={setPaginationModel}
                />
            </div>
        </AdminAuthenticatedLayout>
    );
};

export default memo(Index);

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
