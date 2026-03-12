import React, { memo, useEffect, useState, FC, ChangeEvent } from "react";
import { router, usePage, Head } from "@inertiajs/react";
import AdminAuthenticatedLayout from "@/Layouts/AdminAuthenticatedLayout";
import DataTypeTable from "./Components/DataTypeTable";
import { usePrevious } from "react-use";
import { BgColor, HoverBgColor, TextColor } from "@/utils/theme";

interface MobileNetwork {
    id: number;
    name: string;
    plan_types?: any[];
}

interface DataType {
    id: number;
    name: string;
    network: MobileNetwork;
    active: boolean;
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
    theme: string;
    mobile_networks: MobileNetwork[];
    enable_add_datatype: string;
    data_types: DataType[];
    [key: string]: any;
}

interface NetworkProps {
    data: MobileNetwork;
    onChange: (data: MobileNetwork) => void;
    field_name: string;
    valueSelected: number;
    theme: string;
}

const Network: FC<NetworkProps> = ({ data, onChange, field_name, valueSelected, theme }) => {
    return (
        <div>
            <input
                className="hidden"
                type="radio"
                name={field_name}
                value={data.id}
                id={data.name}
                onChange={() => onChange(data)}
            />
            <label
                htmlFor={data.name}
                className={` ${HoverBgColor[theme as keyof typeof HoverBgColor]
                    } hover:text-theme-1 shadow-sm   border text-center flex cursor-pointer  px-4 py-1  justify-center   ${
                        valueSelected === data.id
                            ? BgColor[theme as keyof typeof BgColor] + " text-theme-1"
                            : TextColor[theme as keyof typeof TextColor] + " bg-theme-1"
                    } `}
            >
                <span className="text-base capitalize  flex">{data.name}</span>
            </label>
        </div>
    );
};

const Index: FC = () => {
    const {
        auth,
        theme,
        mobile_networks,
        enable_add_datatype,
        data_types: data,
    } = usePage<PageProps>().props;

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
        <AdminAuthenticatedLayout auth={auth} title="Data Plans">
            <Head title="Data Types" />
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
                />
            </div>
        </AdminAuthenticatedLayout>
    );
};

export default memo(Index);
