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

interface EditDataType {
    id?: number;
    name?: string;
    network_id?: number;
    active?: boolean;
}

interface PageProps {
    mobile_networks: MobileNetwork[];
    [key: string]: any;
}

interface DataPlanTypeFieldProps {
    handleClose: (val: boolean) => void;
    editData: EditDataType | "";
}

interface FormData {
    mobile_network_id: string | number;
    name: string;
    active: boolean | number;
    [key: string]: any;
}

const DataPlanTypeField: FC<DataPlanTypeFieldProps> = ({ handleClose, editData }) => {
    const { mobile_networks } = usePage<PageProps>().props;

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
    });

    const { data, setData, post, put, processing, setError, errors } =
        useForm<FormData>({
            mobile_network_id: editData && typeof editData === 'object' ? (editData.network_id ?? "") : "",
            name: editData && typeof editData === 'object' ? (editData.name ?? "") : "",
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
                    }),
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
                post(route("data_plan_types.store"), {
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

    return (
        <form onSubmit={submit} className="flex flex-col gap-4 p-4 w-full">
            <div className="space-y-2">
                <Label htmlFor="mobile_network_id">Select Network Type</Label>
                <Select
                    value={String(data.mobile_network_id)}
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
                        <SelectItem value="">Select Network</SelectItem>
                        {mobile_networks && mobile_networks.map((network) => (
                            <SelectItem key={network.id} value={String(network.id)}>
                                {network.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
