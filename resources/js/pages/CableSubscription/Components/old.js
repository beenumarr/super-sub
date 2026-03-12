import React, { useEffect, useState } from "react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import AlertModal from "./Components/AlertModal";
import TextInputRounded from "@/Components/TextInputRounded";
import { usePrevious } from "react-use";
import NormalButton from "@/Components/NormalButton";
import notify from "@/Components/Toast";
import InputError from "@/Components/InputError";
import MobileNetWorkIcon from "@/Components/MobileNetWorkIcon";

export default function Index(props) {
    const [formModal, setFormModal] = useState({
        show: false,
        title: "",
        message: "",
    });
    const { filters, mobile_networks, data_plan_types, data_plans } =
        usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        mobile_network: filters.mobile_network || "",
        phone_number: "",
        amount: "",
        data_plan_id: "",
        data_plan_type: filters.data_plan_type || "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("buy_data.store"), {
            onSuccess: () => {
                setFormModal({
                    show: true,
                    title: " Transaction Successful!",
                    message: "Your transaction has been successfully",
                });
            },
            onError: (errors) => {
                if (errors.data_plan_id) {
                    setFormModal({
                        show: true,
                        title: " Transaction Failed!",
                        message: "You dont have suffient balance!",
                        type: "error",
                    });
                } else {
                    Object.values(errors)
                        .flat()
                        .map((err) => notify("error", err));
                }
            },
        });
    };

    const [filterValues, setFilterValue] = useState({
        mobile_network: filters.mobile_network || "",
        data_plan_type: filters.data_plan_type || "",
    });

    const prevValues = usePrevious(filterValues);

    useEffect(() => {
        if (prevValues) {
            const query = Object.keys(filterValues).length
                ? filterValues
                : { remember: "forget" };

            router.get(route().current(), query, {
                replace: false,
                preserveState: true,
            });
        }
    }, [filterValues]);

    function handleFilter(name, value, default_plan) {
        if (name === "mobile_network") {
            setFilterValue({
                mobile_network: value,
                data_plan_type: default_plan,
            });
            setData({
                amount: "",
                mobile_network: value,
                data_plan_type: default_plan,
            });
        } else {
            setFilterValue((filterValues) => ({
                ...filterValues,
                [name]: value,
            }));

            setData({
                ...data,
                [name]: value,
            });
        }
    }

    return (
        <Authenticated
            auth={props.auth}
            header={
                <h2 className="font-medium text-xl text-gray-800 leading-tight">
                    Buy Data
                </h2>
            }
        >
            <Head title="Buy Data" />
            <form
                onSubmit={submit}
                className=" flex flex-col p-3 w-full justify-center "
            >
                <div className="bg-theme-2 px-2  mb-6 h-28 rounded-md hover:shadow-2xl w-full items-center  text-center justify-center flex  shadow-md text-theme-1 ">
                    {mobile_networks.map((network, i) => (
                        <MobileNetWorkIcon
                            key={i}
                            onChange={handleFilter}
                            value={data.mobile_network}
                            field_name="mobile_network"
                            {...network}
                        />
                    ))}
                </div>

                <TextInputRounded
                    id="phone_number"
                    label="Phone Number"
                    type="text"
                    name="phone_number"
                    value={data.phone_number}
                    autoComplete="phone_number"
                    isFocused={true}
                    onChange={(e) => setData("phone_number", e.target.value)}
                />
                <InputError message={errors.phone_number} className="mt-2" />

                <div className="  my-6 w-full items-center  text-center justify-start flex   ">
                    {data_plan_types.map((network, i) => (
                        <DataPlanTypeCard
                            key={i}
                            onChange={handleFilter}
                            value={data.data_plan_type}
                            field_name="data_plan_type"
                            {...network}
                        />
                    ))}
                </div>

                <label htmlFor="">Select Data Plan</label>
                <div className="grid grid-cols-2 mb-6 w-full items-center  text-center justify-start   ">
                    {data_plans.map((network, i) => (
                        <DataPlanCard
                            key={i}
                            onChange={(e) => {
                                setData({
                                    ...data,
                                    data_plan_id: network.id,
                                    amount: network.amount,
                                });
                            }}
                            fieldValue={data.data_plan_id}
                            field_name="data_plan_id"
                            {...network}
                        />
                    ))}
                </div>

                <TextInputRounded
                    id="amount"
                    placeHolder="&#8358; Amount"
                    type="number"
                    readOnly
                    disabled
                    name="amount"
                    value={data.amount}
                />

                <div className="mt-10">
                    <NormalButton
                        className="w-full justify-center"
                        disabled={processing}
                    >
                        Purchase
                    </NormalButton>
                </div>

                {/* Amount */}
            </form>

            <AlertModal setFormModal={setFormModal} formModal={formModal} />
        </Authenticated>
    );
}

function DataPlanTypeCard({ ...props }) {
    return (
        <div>
            <input
                className="hidden"
                type="radio"
                name={props.field_name}
                value={props.id}
                id={props.name}
                onChange={() =>
                    props.onChange(props.field_name, props.id, null)
                }
            />
            <label
                htmlFor={props.name}
                className={` hover:bg-theme-2 hover:text-theme-1 shadow-md border-theme-2  border text-center flex cursor-pointer  px-4 py-1 m-2 justify-center mx-2 rounded-full ${
                    Number(props.value) === props.id
                        ? "bg-theme-2 text-theme-1"
                        : "text-theme-2 bg-theme-1 "
                } `}
            >
                <span className="text-xs capitalize  flex">{props.name}</span>
            </label>
        </div>
    );
}

function DataPlanCard({ ...props }) {
    return (
        <div>
            <input
                className="hidden"
                type="radio"
                name={props.field_name}
                value={props.id}
                id={props.name}
                onChange={props.onChange}
            />
            <label
                htmlFor={props.name}
                className={` hover:bg-theme-2 hover:text-theme-1 shadow-md border-theme-2  border text-center flex cursor-pointer  px-4 py-2 m-2 justify-center mx-2 rounded-full ${
                    Number(props.fieldValue) === props.id
                        ? "bg-theme-2 text-theme-1"
                        : "text-theme-2 bg-theme-1 "
                } `}
            >
                <span className="text-sm capitalize">{props.name}</span>
            </label>
        </div>
    );
}
