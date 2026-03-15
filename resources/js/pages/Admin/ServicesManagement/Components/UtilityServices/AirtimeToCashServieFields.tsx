import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-hot-toast';

interface AirtimeToCashService {
    name: string;
    airtime_to_cash_active: number | boolean;
    airtime_to_cash_limit: string | number | null;
    airtime_to_cash_api_id?: number | string | null;
}

type AirtimeToCashFormData = {
    services: {
        [key: string]: string | number | boolean | null;
    }[];
};

interface AirtimeToCashServieFieldsProps {
    handleClose: () => void;
    editData: AirtimeToCashService[];
}

export default function AirtimeToCashServieFields({ handleClose, editData }: AirtimeToCashServieFieldsProps) {
    const { apis } = usePage().props as unknown as { apis: { id: number; name: string }[] };
    const initialServices: AirtimeToCashFormData['services'] = editData.map((s) => ({
        ...s,
        airtime_to_cash_api_id: s.airtime_to_cash_api_id != null ? String(s.airtime_to_cash_api_id) : '',
    }));

    const { data, setData, put, processing } = useForm<AirtimeToCashFormData>({
        services: initialServices,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(
            route('airtime_to_cash_services.update', {
                airtime_to_cash_service: 1,
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

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const updatedServices = data.services.map((service) =>
            service.name === e.target.name
                ? {
                      ...service,
                      airtime_to_cash_active: e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : service.airtime_to_cash_active,
                      airtime_to_cash_api_id: e.target.type === 'select-one' ? e.target.value : service.airtime_to_cash_api_id,
                      airtime_to_cash_limit: e.target.type === 'text' ? e.target.value : service.airtime_to_cash_limit,
                  }
                : service,
        );
        setData({ services: updatedServices });
    };

    const getValue = (name: string, key: keyof AirtimeToCashService) => {
        const service = data.services.find((s) => s.name === name);
        return service ? service[key] : undefined;
    };

    return (
        <form onSubmit={submit} className="flex w-full flex-col justify-center px-3">
            {editData.map((service, i) => (
                <NetworkService
                    key={i}
                    apis={apis}
                    airtime_to_cash_active={getValue(service.name, 'airtime_to_cash_active') as number | boolean}
                    airtime_to_cash_api_id={getValue(service.name, 'airtime_to_cash_api_id') as number | string | null}
                    airtime_to_cash_limit={getValue(service.name, 'airtime_to_cash_limit') as string | number | null}
                    service={service}
                    handleChange={handleChange}
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

interface NetworkServiceProps {
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    service: AirtimeToCashService;
    airtime_to_cash_active: number | boolean;
    apis: { id: number; name: string }[];
    airtime_to_cash_limit: string | number | null;
    airtime_to_cash_api_id?: number | string | null;
}

function NetworkService({ handleChange, service, airtime_to_cash_active, apis, airtime_to_cash_limit, airtime_to_cash_api_id }: NetworkServiceProps) {
    const { isStl } = usePage().props as unknown as { isStl: boolean };
    return (
        <div className="mt-4">
            <span className="flex w-full truncate border-b py-1 text-center text-lg font-medium">{service.name}</span>

            <div className="flex w-full p-2">
                <span className="mr-auto flex w-1/2">Limit: </span>
                <span className="-mt-4 ml-auto flex w-1/2 flex-col space-y-1">
                    <Label htmlFor={`limit-${service.name}`} className="text-xs">
                        Limit (NGN)
                    </Label>
                    <Input
                        id="airtime_to_cash_limit"
                        type="number"
                        className="h-8 w-40"
                        value={airtime_to_cash_limit as string | number | undefined}
                        onChange={handleChange}
                    />
                </span>
            </div>
            {isStl && (
                <div className="flex w-full p-2">
                    <span className="mr-auto flex w-1/2">Vending Medium Api:</span>
                    <span className="-mt-4 ml-auto flex w-1/2 flex-col space-y-1">
                        <Label htmlFor={`api-${service.name}`} className="text-xs">
                            Vending Medium API
                        </Label>
                        <Select
                            value={airtime_to_cash_api_id != null && airtime_to_cash_api_id !== '' ? String(airtime_to_cash_api_id) : 'none'}
                            onValueChange={(value) =>
                                handleChange({
                                    target: { name: service.name, type: 'select-one', value: value === 'none' ? '' : value },
                                } as unknown as ChangeEvent<HTMLSelectElement>)
                            }
                        >
                            <SelectTrigger id={`api-${service.name}`} className="h-8 w-40">
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
                    </span>
                </div>
            )}

            <div className="flex w-full p-2">
                <span className="mr-auto flex w-1/2">Service: </span>
                <span className="ml-auto flex w-1/2">
                    <label className="mr-auto flex items-center">
                        <Switch
                            checked={!!airtime_to_cash_active}
                            onCheckedChange={(checked) =>
                                handleChange({
                                    target: {
                                        name: service.name,
                                        type: 'checkbox',
                                        checked,
                                        id: 'airtime_to_cash_active',
                                        value: airtime_to_cash_active as number | boolean,
                                    },
                                } as unknown as ChangeEvent<HTMLInputElement>)
                            }
                        />
                        <span className="ml-2 text-sm text-gray-600">{airtime_to_cash_active ? 'Active' : 'Disabled'}</span>
                    </label>
                </span>
            </div>
        </div>
    );
}
