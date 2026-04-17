import { useForm, usePage } from "@inertiajs/react";
import { FC, ChangeEvent, FormEvent } from "react";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MobileNetwork {
    id: number;
    name: string;
}

interface TransactionApiOption {
    id: number;
    name: string;
}

interface EditDataType {
    id?: number;
    name?: string;
    network_id?: number;
    mobile_network_id?: number;
    code?: string;
    transaction_api_id?: number;
    active?: boolean;
}

interface PageProps {
    mobile_networks: MobileNetwork[];
    apis?: TransactionApiOption[];
    [key: string]: any;
}

interface DataPlanTypeFieldProps {
    handleClose: (open: boolean) => void;
    editData: EditDataType | "";
}

interface FormData {
    mobile_network_id: string | number;
    transaction_api_id: string | number;
    name: string;
    code: string;
    active: boolean | number;
    [key: string]: any;
}

const DataPlanTypeField: FC<DataPlanTypeFieldProps> = ({ handleClose, editData }) => {
    const { mobile_networks, apis = [] } = usePage<PageProps>().props;

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        code: Yup.string().required("Plan code is required"),
        transaction_api_id: Yup.string().required("Transaction API is required"),
    });

    const { data, setData, post, put, processing, setError, errors } =
        useForm<FormData>({
            mobile_network_id: editData && typeof editData === 'object'
                ? (editData.mobile_network_id ?? editData.network_id ?? "")
                : "",
            transaction_api_id: editData && typeof editData === 'object' ? (editData.transaction_api_id ?? "") : "",
            name: editData && typeof editData === 'object' ? (editData.name ?? "") : "",
            code: editData && typeof editData === 'object' ? (editData.code ?? "") : "",
            active: editData && typeof editData === 'object' ? (editData.active ?? 1) : 1,
        });

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await validationSchema.validate(data, { abortEarly: false });

            if (editData && typeof editData === 'object' && editData.id) {
                put(
                    route("data_plan_types.update", {
                        data_plan_type: editData.id,
                    }, false),
                    {
                        onSuccess: () => {
                            handleClose(false);
                        },
                        onError: (errors) => {
                            console.error("Update error:", errors);
                        },
                    }
                );
            } else {
                post(route("data_plan_types.store", undefined, false), {
                    onSuccess: () => {
                        handleClose(false);
                    },
                    onError: (errors) => {
                        console.error("Create error:", errors);
                    },
                });
            }
        } catch (err: any) {
            const formattedErrors = err?.inner?.reduce((acc: any, curr: any) => {
                acc[curr.path] = curr.message;
                return acc;
            }, {});
            setError(formattedErrors);
        }
    };

    const selectedNetwork = data.mobile_network_id
        ? String(data.mobile_network_id)
        : undefined;

    const selectedApi = data.transaction_api_id
        ? String(data.transaction_api_id)
        : undefined;

    return (
        <form onSubmit={submit} className="flex flex-col gap-4 p-4 w-full">
            <div className="space-y-2">
                <Label htmlFor="mobile_network_id">Select Network Type</Label>
                <Select
                    value={selectedNetwork}
                    onValueChange={(value) =>
                        setData({
                            ...data,
                            mobile_network_id: value,
                        })
                    }
                >
                    <SelectTrigger id="mobile_network_id">
                        <SelectValue placeholder="Select Network" />
                    </SelectTrigger>
                    <SelectContent>
                        {mobile_networks && mobile_networks.map((network) => (
                            <SelectItem key={network.id} value={String(network.id)}>
                                {network.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="transaction_api_id">Transaction API</Label>
                <Select
                    value={selectedApi}
                    onValueChange={(value) =>
                        setData({
                            ...data,
                            transaction_api_id: value,
                        })
                    }
                >
                    <SelectTrigger id="transaction_api_id">
                        <SelectValue placeholder="Select Transaction API" />
                    </SelectTrigger>
                    <SelectContent>
                        {apis.map((api) => (
                            <SelectItem key={api.id} value={String(api.id)}>
                                {api.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.transaction_api_id && <span className="text-sm text-red-600">{errors.transaction_api_id}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setData("name", e.target.value)}
                    placeholder="Enter data type name"
                />
                {errors.name && <span className="text-sm text-red-600">{errors.name}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="code">Plan Code</Label>
                <Input
                    id="code"
                    type="text"
                    name="code"
                    value={data.code}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setData("code", e.target.value)}
                    placeholder="Enter plan code (e.g. SME, GIFTING)"
                />
                {errors.code && <span className="text-sm text-red-600">{errors.code}</span>}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
                <Button variant="outline" type="button" onClick={() => handleClose(false)}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? "Submitting..." : "Submit"}
                </Button>
            </div>
        </form>
    );
};

export default DataPlanTypeField;
