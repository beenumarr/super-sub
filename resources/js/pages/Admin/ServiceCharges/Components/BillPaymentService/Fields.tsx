import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface ServiceCharge {
    id: number;
    package_name: string;
    active: number;
    amount: string;
}

interface EditData {
    id: number;
    name: string;
    service_charges: ServiceCharge[];
}

interface FieldProps {
    handleClose: () => void;
    editData: EditData;
}

interface PackageDiscountProps {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    data: ServiceCharge;
    amount: string | number;
}

export default function Field({ handleClose, editData }: FieldProps) {
    const { data, setData, put, processing, errors } = useForm({
        service_charges: editData.service_charges ?? [],
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(route("service-charges.bill-payment"), {
            onSuccess: () => {
                toast.success("Settings Updated Successfully");
                handleClose();
            },
            onError: (errors) => {
                Object.values(errors).flat().forEach((err: any) => {
                    toast.error(err);
                });
            },
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedservice_charge = data.service_charges?.map((service_charge) =>
            service_charge.package_name === e.target.name
                ? {
                      ...service_charge,
                      active:
                          e.target.type === "checkbox"
                              ? e.target.checked
                                  ? 1
                                  : 0
                              : service_charge.active,
                      amount:
                          e.target.type === "number"
                              ? e.target.value
                              : service_charge.amount,
                  }
                : service_charge
        );
        setData({ service_charges: updatedservice_charge });
    };

    const getValue = (id: number, key: keyof ServiceCharge) => {
        const service_charge = data.service_charges.find((sc) => sc.id === id);
        return service_charge?.[key];
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editData.name}</h3>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {editData.service_charges?.map((item) => (
                    <PackageDiscount
                        key={item.id}
                        handleChange={handleChange}
                        amount={getValue(item.id, "amount")}
                        data={item}
                    />
                ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t dark:border-gray-800">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={processing}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing} className="gap-2">
                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Update
                </Button>
            </div>
        </form>
    );
}

function PackageDiscount({ handleChange, data, amount }: PackageDiscountProps) {
    return (
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800">
            <span className="font-medium text-gray-700 dark:text-white min-w-[150px]">{data.package_name}</span>
            <div className="flex items-center gap-2">
                <label htmlFor={`amount-${data.id}`} className="text-sm text-gray-600 dark:text-gray-400">
                    Amount (₦):
                </label>
                <Input
                    id={`amount-${data.id}`}
                    type="number"
                    name={data.package_name}
                    value={amount}
                    onChange={handleChange}
                    className="w-32"
                    placeholder="0.00"
                    step="0.01"
                />
            </div>
        </div>
    );
}
