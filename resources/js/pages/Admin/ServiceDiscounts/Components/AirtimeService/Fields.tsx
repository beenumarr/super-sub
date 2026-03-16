import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

interface ServiceDiscount {
    id: number;
    package_name: string;
    amount: number;
    active: number;
}

interface EditData {
    id: number;
    name: string;
    service_discounts: ServiceDiscount[];
}

interface FieldProps {
    handleClose: () => void;
    editData: EditData;
}

interface FormData {
    service_discounts: ServiceDiscount[];
}

export default function Field({ handleClose, editData }: FieldProps) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        service_discounts: editData.service_discounts,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('service-discounts.airtime'), {
            onSuccess: () => {
                toast.success('Settings updated successfully');
                handleClose();
            },
            onError: (err) => {
                const errorObj = err as Record<string, string | string[]>;
                Object.values(errorObj).forEach((error) => {
                    const errorMessages = Array.isArray(error) ? error : [error];
                    errorMessages.forEach((msg) => toast.error(msg));
                });
            },
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const updatedservice_discount = data.service_discounts.map(
            (service_discount) =>
                service_discount.package_name === name
                    ? {
                          ...service_discount,
                          active:
                              type === 'checkbox'
                                  ? checked
                                      ? 1
                                      : 0
                                  : service_discount.active,
                          amount:
                              type === 'number'
                                  ? Number(value)
                                  : service_discount.amount,
                      }
                    : service_discount
        );
        setData({ service_discounts: updatedservice_discount });
    };

    const getValue = (id: number, key: string): any => {
        const service_discount = data.service_discounts.find(
            (service_discount) => service_discount.id === id
        );
        return service_discount ? service_discount[key as keyof ServiceDiscount] : '';
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="space-y-4">
                {editData.service_discounts.map((it) => (
                    <PackageDiscount
                        key={it.id}
                        handleChange={handleChange}
                        amount={getValue(it.id, 'amount')}
                        data={it}
                    />
                ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t dark:border-gray-800 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        'Update'
                    )}
                </Button>
            </div>
        </form>
    );
}

interface PackageDiscountProps {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    data: ServiceDiscount;
    amount: number;
}

function PackageDiscount({ handleChange, data, amount }: PackageDiscountProps) {
    return (
        <div className="flex items-end gap-4 rounded-lg border border-gray-200 dark:border-gray-800 p-4 dark:bg-gray-900/20">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {data.package_name}
                </label>
                <Input
                    type="text"
                    disabled
                    value={data.package_name}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
            </div>
            <div className="flex-1">
                <label
                    htmlFor={`amount-${data.id}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    Discount Amount (%)
                </label>
                <Input
                    id={`amount-${data.id}`}
                    type="number"
                    name={data.package_name}
                    value={amount}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                />
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id={`active-${data.id}`}
                    name={data.package_name}
                    checked={data.active === 1}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                />
                <label
                    htmlFor={`active-${data.id}`}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Active
                </label>
            </div>
        </div>
    );
}
