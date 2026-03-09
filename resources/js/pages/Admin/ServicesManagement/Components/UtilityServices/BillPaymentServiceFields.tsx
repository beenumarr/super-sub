import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-hot-toast';

interface ApiDefinition {
    id: number;
    name: string;
}

interface BillPaymentService {
    name: string;
    api_id: string;
    code: string;
    active: number | boolean;
}

interface BillPaymentServiceFieldsProps {
    handleClose: () => void;
    editData: BillPaymentService[];
}

export default function BillPaymentServiceFields({ handleClose, editData }: BillPaymentServiceFieldsProps) {
    const { apis, isStl, electricicty_bill_transaction_api_id } = usePage().props as unknown as {
        apis: ApiDefinition[];
        isStl: boolean;
        electricicty_bill_transaction_api_id: number | string | null;
    };

    const { data, setData, put, processing } = useForm<{
        services: { name: string; api_id: string; code: string; active: number | boolean }[];
        electricicty_bill_transaction_api_id: string;
    }>({
        services: editData as unknown as { name: string; api_id: string; code: string; active: number | boolean }[],
        electricicty_bill_transaction_api_id:
            electricicty_bill_transaction_api_id != null ? String(electricicty_bill_transaction_api_id) : '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(
            route('bill_payment_services.update', {
                bill_payment_service: 1,
            }),
            {
                onSuccess: () => {
                    toast.success('Settings Updated Successfully', {
                        duration: 3000,
                    });
                    handleClose();
                },
                onError: (errors) => {
                    Object.values(errors)
                        .flat()
                        .map((err) =>
                            toast.error(err, {
                                duration: 3000,
                            }),
                        );
                },
            },
        );
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const updatedServices = data.services.map((service) =>
            service.name === e.target.name
                ? {
                      ...service,
                      active: e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : service.active,
                      // id is either "api_id" or "code"
                      [e.target.id]:
                          e.target.type === 'text'
                              ? e.target.value
                              : // @ts-expect-error dynamic access from backend
                                service[e.target.id],
                  }
                : service,
        );
        setData({ ...data, services: updatedServices });
    };

    const getValue = (name: string, key: keyof BillPaymentService) => {
        const service = data.services.find((s) => s.name === name);
        return service ? service[key] : undefined;
    };

    return (
        <form onSubmit={submit} className="flex h-full w-full flex-col justify-center p-3">
            <div className="mb-6">
                {isStl && (
                    <div className="space-y-1.5">
                        <Label htmlFor="electricicty_bill_transaction_api_id">Vending Medium API</Label>
                        <Select
                            value={data.electricicty_bill_transaction_api_id || 'none'}
                            onValueChange={(value) => {
                                setData({
                                    ...data,
                                    electricicty_bill_transaction_api_id: value === 'none' ? '' : value,
                                });
                            }}
                        >
                            <SelectTrigger id="electricicty_bill_transaction_api_id">
                                <SelectValue placeholder="Select Api" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Select Api</SelectItem>
                                {apis.map((api) => (
                                    <SelectItem key={api.id} value={String(api.id)}>
                                        {api.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
            {editData.map((service, i) => (
                <CableTvService
                    key={i}
                    handleChange={handleChange}
                    active={getValue(service.name, 'active') as number | boolean}
                    code={getValue(service.name, 'code') as string}
                    api_id={getValue(service.name, 'api_id') as string}
                    service={service}
                />
            ))}

            <div className="mt-4 flex items-center justify-end">
                <Button type="submit" disabled={processing}>
                    Update
                </Button>
            </div>
        </form>
    );
}

interface CableTvServiceProps {
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    service: BillPaymentService;
    code: string;
    api_id: string;
    active: number | boolean;
}

function CableTvService({ handleChange, service, code, api_id, active }: CableTvServiceProps) {
    return (
        <div className="mt-4">
            <span className="flex w-full truncate border-b py-1 text-center text-lg font-medium">{service.name}</span>
            <div className="flex w-full p-2">
                <span className="mr-auto flex w-1/2">API ID: </span>
                <span className="ml-auto flex w-1/2">
                    <Input id="api_id" type="text" className="h-8 w-40" name={service.name} value={api_id} onChange={handleChange} />
                </span>
            </div>

            <div className="flex w-full p-2">
                <span className="mr-auto flex w-1/2">API Cable Name: </span>
                <span className="ml-auto flex w-1/2">
                    <Input id="code" type="text" className="h-8 w-40" name={service.name} value={code} onChange={handleChange} />
                </span>
            </div>

            <div className="flex w-full p-2">
                <span className="mr-auto flex w-1/2">Service: </span>
                <span className="ml-auto flex w-1/2">
                    <label className="mr-auto flex items-center">
                        <Switch
                            checked={!!active}
                            onCheckedChange={(checked) =>
                                handleChange({
                                    // fabricate a checkbox-like event shape for existing handler
                                    target: {
                                        name: service.name,
                                        type: 'checkbox',
                                        checked,
                                        id: 'active',
                                        value: active as number | boolean,
                                    },
                                } as unknown as ChangeEvent<HTMLInputElement>)
                            }
                        />
                        <span className="ml-2 text-sm text-gray-600">{active ? 'Active' : 'Disabled'}</span>
                    </label>
                </span>
            </div>
        </div>
    );
}
