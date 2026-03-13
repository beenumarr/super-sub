import React from "react";
import { useForm, usePage } from "@inertiajs/react";
import TextInputRounded from "@/Components/TextInputRounded";
import NormalButton from "@/Components/NormalButton";
import notify from "@/Components/Toast";
import InputError from "@/Components/InputError";
import * as Yup from "yup";
import SelectInputRounded from "@/Components/SelectInputRounded";

interface CableNetwork {
    id: string | number;
    name: string;
}

interface TransactionApi {
    id: number;
    name: string;
}

interface ApiPlanId {
    id?: number;
    transaction_api_id: number;
    product_id: string | number;
    product_code: string | number;
}

interface CablePlanFormData {
    cable_network_id: string | number;
    product_code: string | number;
    validity: string | number;
    amount: string | number;
    package_name: string;
    api_ids: ApiPlanId[];
}

interface CablePlan {
    id?: string | number;
    cable_network_id?: string | number;
    product_code?: string | number;
    validity?: string | number;
    amount?: string | number;
    package_name?: string;
    api_ids?: ApiPlanId[];
}

interface PageProps {
    cable_networks: CableNetwork[];
    apis: TransactionApi[];
    isStl: boolean;
}

interface CableSubscriptionPlanFieldProps {
    handleClose: () => void;
    editData: CablePlan | "";
}

export default function CableSubscriptionPlanField({
    handleClose,
    editData,
}: CableSubscriptionPlanFieldProps) {
    const { cable_networks, apis, isStl } = usePage<PageProps>().props;

    const validationSchema = Yup.object().shape({
        package_name: Yup.string().required("Package Name is required"),
        product_code: Yup.string().required("Product Code is required"),
    });

    const { data, setData, post, put, processing, setError, errors } =
        useForm<CablePlanFormData>({
            cable_network_id: editData?.cable_network_id ?? "",
            product_code: editData?.product_code ?? "",
            validity: editData?.validity ?? "",
            amount: editData?.amount ?? "",
            package_name: editData?.package_name ?? "",
            api_ids: editData?.api_ids ?? [],
        });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
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
            .catch((err: any) => {
                const formattedErrors =
                    err?.inner?.reduce(
                        (acc: Record<string, string>, curr: { path: string; message: string }) => {
                            acc[curr.path] = curr.message;
                            return acc;
                        },
                        {}
                    ) ?? {};
                setError(formattedErrors);
            });
    };

    const getValue = (id: number, key: keyof ApiPlanId) => {
        const api = data.api_ids.find((aid) => aid.transaction_api_id === id);

        return api ? api[key] : "";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedApiId = [...data.api_ids];

        const product_id = e.target.value;
        const transaction_api_id = Number(e.target.id);

        const existingIndex = updatedApiId.findIndex(
            (api) => api.transaction_api_id === transaction_api_id
        );

        if (existingIndex !== -1) {
            updatedApiId[existingIndex] = {
                ...updatedApiId[existingIndex],
                product_id: Number.isNaN(Number(product_id)) ? 1 : product_id,
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

                {cable_networks.map((network) => (
                    <option key={String(network.id)} value={network.id}>
                        {network.name}
                    </option>
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
            <InputError message={errors.product_code} className="mt-2" />

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
                apis.map((api) => (
                    <div key={api.id}>
                        <TextInputRounded
                            id={String(api.id)}
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
