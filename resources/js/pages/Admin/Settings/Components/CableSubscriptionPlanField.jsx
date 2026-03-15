import React, { useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import TextInputRounded from "@/Components/TextInputRounded";
import NormalButton from "@/Components/NormalButton";
import notify from "@/Components/Toast";
import InputError from "@/Components/InputError";
import * as Yup from "yup";
import SelectInputRounded from "@/Components/SelectInputRounded";

export default function CableSubscriptionPlanField({ handleClose, editData }) {
    const { cable_networks, apis, isStl } = usePage().props;

    const validationSchema = Yup.object().shape({
        package_name: Yup.string().required("Package Name is required"),
        product_code: Yup.string().required("Product Code is required"),
    });

    const { data, setData, post, put, processing, setError, errors, reset } =
        useForm({
            cable_network_id: editData?.cable_network_id ?? "",
            product_code: editData?.product_code ?? "",
            validity: editData?.validity ?? "",
            amount: editData?.amount ?? "",
            package_name: editData?.package_name ?? "",
            api_ids: editData?.api_ids ?? [],
        });

    const submit = (e) => {
        e.preventDefault();

        validationSchema
            .validate(data, { abortEarly: false })
            .then(() => {
                if (editData != "") {
                    put(
                        route("cable_subscription_plans.update", {
                            cable_subscription_plan: editData.id,
                        }),
                        {
                            onSuccess: () => {
                                notify(
                                    "success",
                                    "Data Plan Updated Successfully"
                                );
                                handleClose();
                            },
                            onError: (errors) => {
                                Object.values(errors)
                                    .flat()
                                    .map((err) => notify("error", err));
                            },
                        }
                    );
                } else {
                    post(route("cable_subscription_plans.store"), {
                        onSuccess: () => {
                            notify("success", "Data Plan Added Successfully");
                            handleClose();
                        },
                        onError: (errors) => {
                            Object.values(errors)
                                .flat()
                                .map((err) => notify("error", err));
                        },
                    });
                }
            })
            .catch((err) => {
                const formattedErrors = err?.inner?.reduce((acc, curr) => {
                    acc[curr.path] = curr.message;
                    return acc;
                }, {});
                setError(formattedErrors);
            });
    };

    const getValue = (id, key) => {
        const api = data.api_ids.find((aid) => aid.transaction_api_id === id);

        return api ? api[key] : "";
    };

    const handleChange = (e) => {
        const updatedApiId = [...data.api_ids];

        const product_id = e.target.value;
        const transaction_api_id = Number(e.target.id);

        const existingIndex = updatedApiId.findIndex(
            (api) => api.transaction_api_id === transaction_api_id
        );

        if (existingIndex !== -1) {
            updatedApiId[existingIndex] = {
                ...updatedApiId[existingIndex],
                product_id: isNaN(product_id) ? 1 : product_id,
                product_code: product_id,
            };
        } else {
            updatedApiId.push({
                id: transaction_api_id,
                product_id: product_id,
                product_code: product_id,
                transaction_api_id: transaction_api_id,
            });
        }

        setData({
            ...data,
            api_ids: updatedApiId,
        });
    };

    return (
        <form
            onSubmit={submit}
            className=" flex flex-col p-3 w-full justify-center "
        >
            <SelectInputRounded
                label="Select Network Type"
                name="cable_network_id"
                onChange={(e) => setData("cable_network_id", e.target.value)}
                value={data.cable_network_id}
            >
                <option value="">Select Cable Type</option>

                {cable_networks.map((network, i) => (
                    <option value={network.id}>{network.name}</option>
                ))}
            </SelectInputRounded>

            <TextInputRounded
                id="package_name"
                label="Package Name"
                name="package_name"
                value={data.package_name}
                error={errors.package_name && true}
                onChange={(e) => setData("package_name", e.target.value)}
            />
            <InputError message={errors.package_name} className="mt-2" />

            <TextInputRounded
                id="product_code"
                label="Product Code"
                name="product_code"
                value={data.product_code}
                error={errors.product_code && true}
                onChange={(e) => setData("product_code", e.target.value)}
            />
            <InputError message={errors.package_name} className="mt-2" />

            <TextInputRounded
                id="amount"
                label="Amount (&#8358;)"
                placeHolder="&#8358; Amount"
                type="number"
                name="amount"
                onChange={(e) => setData("amount", e.target.value)}
                value={data.amount}
            />

            <TextInputRounded
                id="validity"
                label="Plan Validity"
                type="text"
                name="validity"
                value={data.validity}
                error={errors.validity && true}
                onChange={(e) => setData("validity", e.target.value)}
            />
            <InputError message={errors.validity} className="mt-2" />

            {isStl &&
                apis.map((api, i) => (
                    <div key={i}>
                        <TextInputRounded
                            id={api.id}
                            label={api.name}
                            type="text"
                            value={getValue(api.id, "product_code")}
                            error={errors.api_plan_id && true}
                            onChange={handleChange}
                            onBlur={handleChange}
                        />
                        <InputError
                            message={errors.api_plan_id}
                            className="mt-2"
                        />
                    </div>
                ))}

            <div className="flex items-center justify-end mt-4">
                <span>
                    <NormalButton processing={processing} type="submit">
                        Submit
                    </NormalButton>
                </span>
            </div>
        </form>
    );
}
