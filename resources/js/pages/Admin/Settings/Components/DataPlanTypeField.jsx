import { useForm, usePage } from "@inertiajs/react";
import TextInputRounded from "@/Components/TextInputRounded";
import NormalButton from "@/Components/NormalButton";
import notify from "@/Components/Toast";
import InputError from "@/Components/InputError";
import * as Yup from "yup";
import SelectInputRounded from "@/Components/SelectInputRounded";

export default function DataPlanTypeField({ handleClose, editData }) {
    const { mobile_networks } = usePage().props;

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
    });

    const { data, setData, post, put, processing, setError, errors, reset } =
        useForm({
            mobile_network_id: editData?.network_id ?? "",
            name: editData?.name ?? "",
            active: editData?.active ?? 1,
        });

    const submit = (e) => {
        e.preventDefault();

        validationSchema
            .validate(data, { abortEarly: false })
            .then(() => {
                if (editData != "") {
                    put(
                        route("data_plan_types.update", {
                            data_plan_type: editData.id,
                        }),
                        {
                            onSuccess: () => {
                                notify(
                                    "success",
                                    "Data Type Updated Successfully"
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
                    post(route("data_plan_types.store"), {
                        onSuccess: () => {
                            notify("success", "Data Type Added Successfully");
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

    return (
        <form
            onSubmit={submit}
            className=" flex flex-col p-3 w-full justify-center "
        >
            <div className="flex w-full gap-2">
                <SelectInputRounded
                    label="Select Network Type"
                    name="mobile_network_id"
                    onChange={(e) =>
                        setData({
                            ...data,
                            mobile_network_id: e.target.value,
                        })
                    }
                    value={data.mobile_network_id}
                >
                    <option value="">Select Network</option>

                    {mobile_networks.map((network, i) => (
                        <option key={i} value={network.id}>
                            {network.name}
                        </option>
                    ))}
                </SelectInputRounded>
            </div>

            <TextInputRounded
                id="name"
                label="Name"
                type="text"
                name="name"
                value={data.name}
                error={errors.name && true}
                onChange={(e) => setData("name", e.target.value)}
            />
            <InputError message={errors.name} className="mt-2" />

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
