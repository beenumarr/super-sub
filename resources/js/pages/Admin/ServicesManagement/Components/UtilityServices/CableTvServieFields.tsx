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

interface CableService {
    name: string;
    code: string;
    active: number | boolean;
    transaction_api_id?: number | string | null;
}

interface CableTvServieFieldsProps {
    handleClose: () => void;
    editData: { name: string; code: string; active: number | boolean; transaction_api_id?: number | string | null }[];
}

export default function CableTvServieFields({ handleClose, editData }: CableTvServieFieldsProps) {
    const { apis } = usePage().props as unknown as { apis: ApiDefinition[] };
    const initialServices = editData.map((s) => ({
        ...s,
        transaction_api_id: s.transaction_api_id != null ? String(s.transaction_api_id) : '',
    }));

    const { data, setData, put, processing } = useForm<{
        services: { name: string; code: string; active: number | boolean; transaction_api_id?: number | string | null }[];
    }>({
        services: initialServices,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(
            route('cable_tv_services.update', {
                cable_tv_service: 1,
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
                      active: e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : service.active,
                      code: e.target.type === 'text' ? e.target.value : service.code,
                      transaction_api_id: e.target.type === 'select-one' ? e.target.value : service.transaction_api_id,
                  }
                : service,
        );
        setData({ services: updatedServices });
    };

    const getValue = (name: string, key: keyof CableService) => {
        const service = data.services.find((s) => s.name === name);
        return service ? service[key] : undefined;
    };

    return (
        <form onSubmit={submit} className="flex w-full flex-col justify-center px-3">
            {editData.map((service, i) => (
                <CableTvService
                    key={i}
                    apis={apis}
                    handleChange={handleChange}
                    active={getValue(service.name, 'active') as number | boolean}
                    code={getValue(service.name, 'code') as string}
                    transaction_api_id={getValue(service.name, 'transaction_api_id') as number | string | null}
                    service={service}
                    setData={
                        setData as (value: {
                            services: { name: string; code: string; active: number | boolean; transaction_api_id?: number | string | null }[];
                        }) => void
                    }
                    data={data}
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
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    service: CableService;
    code: string;
    active: number | boolean;
    apis: ApiDefinition[];
    transaction_api_id?: number | string | null;
    setData: (value: { services: { name: string; code: string; active: number | boolean; transaction_api_id?: number | string | null }[] }) => void;
    data: { services: { name: string; code: string; active: number | boolean; transaction_api_id?: number | string | null }[] };
}

function CableTvService({ handleChange, service, code, active, apis, transaction_api_id }: CableTvServiceProps) {
    const { isStl } = usePage().props as unknown as { isStl: boolean };
    return (
        <div className="mt-4">
            <span className="flex w-full truncate border-b py-1 text-center text-lg font-medium">{service.name}</span>
            <div className="flex w-full p-2">
                <span className="mr-auto flex w-1/2">API ID: </span>
                <span className="-mt-4 ml-auto flex w-1/2 flex-col space-y-1">
                    <Label htmlFor={`api-id-${service.name}`} className="text-xs">
                        API ID
                    </Label>
                    <Input id="api_id" type="text" className="h-8 w-40" name={service.name} value={code} onChange={handleChange} />
                </span>
            </div>
            {isStl && (
                <div className="flex w-full p-2">
                    <span className="mr-auto flex w-1/2">Vending Medium Api: </span>
                    <span className="-mt-4 ml-auto flex w-1/2 flex-col space-y-1">
                        <Label htmlFor={`vendor-${service.name}`} className="text-xs">
                            Vending Medium API
                        </Label>
                        <Select
                            value={transaction_api_id != null && transaction_api_id !== '' ? String(transaction_api_id) : 'none'}
                            onValueChange={(value) =>
                                handleChange({
                                    target: {
                                        name: service.name,
                                        type: 'select-one',
                                        value: value === 'none' ? '' : value,
                                    },
                                } as unknown as ChangeEvent<HTMLSelectElement>)
                            }
                        >
                            <SelectTrigger id={`vendor-${service.name}`} className="h-8 w-40">
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
                            checked={!!active}
                            onCheckedChange={(checked) =>
                                handleChange({
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
