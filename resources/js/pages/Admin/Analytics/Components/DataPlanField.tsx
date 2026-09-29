import { useForm } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";
import UserSearchSelect from "@/components/shared/user-search-select";

interface DataPlanFieldProps {
    setFormModal: (value: boolean) => void;
}

export default function DataPlanField({ setFormModal }: DataPlanFieldProps) {

    const validationSchema = Yup.object().shape({
        user_id: Yup.string().required("Please Select User"),
    });

    const { data, setData, post, processing, setError, errors } = useForm({
        amount: 0,
        user_id: "",
        user: null as any,
        type: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        validationSchema
            .validate(data, { abortEarly: false })
            .then(() => {
                post(route("manual-funding.store"), {
                    onSuccess: () => {
                        toast.success("Account Funded Successfully");
                        setFormModal(false);
                    },
                    onError: (errors: Record<string, any>) => {
                        Object.values(errors)
                            .flat()
                            .forEach((err: any) => toast.error(err));
                    },
                });
            })
            .catch((err: any) => {
                const formattedErrors = err?.inner?.reduce(
                    (acc: Record<string, string>, curr: any) => {
                        acc[curr.path] = curr.message;
                        return acc;
                    },
                    {}
                );
                setError(formattedErrors);
            });
    };

    const bal_after =
        data.type === "debit"
            ? Number(data.user?.wallet_balance) - Number(data.amount)
            : Number(data.user?.wallet_balance) + Number(data.amount);

    return (
        <form onSubmit={submit} className="flex flex-col p-3 w-full gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select User
                </label>
                <UserSearchSelect
                    value={data.user_id}
                    onValueChange={(userId, user) => {
                        setData({
                            ...data,
                            user_id: userId,
                            user: user || null,
                        });
                    }}
                    placeholder="Search & select user (name, email, phone, ID)..."
                    error={errors.user_id}
                />
                {errors.user_id && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {errors.user_id}
                    </p>
                )}
            </div>

            <div className="flex w-full gap-3 items-center justify-start my-3">
                {["credit", "debit"].map((type) => (
                    <FundingType
                        key={type}
                        onChange={() => setData("type", type)}
                        selected={data.type}
                        field_name="funding_type"
                        value={type}
                    />
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (₦)
                </label>
                <Input
                    id="amount"
                    placeholder="₦ Amount"
                    type="number"
                    name="amount"
                    onChange={(e) => setData("amount", parseFloat(e.target.value) || 0)}
                    value={data.amount}
                    step="0.01"
                />
            </div>

            {data.user && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-md space-y-2">
                    <div className="flex justify-between">
                        <span className="font-medium">Balance:</span>
                        <span>₦{data.user?.wallet_balance}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Balance After:</span>
                        <span>₦{bal_after.toFixed(2)}</span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t dark:border-gray-800">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormModal(false)}
                    disabled={processing}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing} className="gap-2">
                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit
                </Button>
            </div>
        </form>
    );
}

interface FundingTypeProps {
    value: string;
    onChange: (value: string) => void;
    field_name: string;
    selected: string;
}

function FundingType({
    value,
    onChange,
    field_name,
    selected,
}: FundingTypeProps) {
    return (
        <>
            <input
                className="hidden"
                type="radio"
                name={field_name}
                value={value}
                id={value}
                onChange={() => onChange(value)}
            />
            <label
                htmlFor={value}
                className={`w-full shadow-sm border text-center flex cursor-pointer px-4 py-2 justify-center rounded-sm transition-colors ${
                    selected === value
                        ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                }`}
            >
                <span className="text-sm capitalize font-medium">{value}</span>
            </label>
        </>
    );
}
