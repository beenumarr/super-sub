import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-hot-toast';

interface WalletFundingService {
    name: string;
    active: number | boolean;
    [key: string]: string | number | boolean | null;
}

interface WalletFundingServiceFieldsProps {
    handleClose: () => void;
    editData: WalletFundingService[];
}

export default function WalletFundingServiceFields({ handleClose, editData }: WalletFundingServiceFieldsProps) {
    const { data, setData, put, processing } = useForm<{ services: WalletFundingService[] }>({
        services: editData,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(
            route('wallet_funding_services.update', {
                wallet_funding_service: 1,
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
                      [e.target.id]: e.target.type === 'text' ? e.target.value : service[e.target.id],
                  }
                : service,
        );
        setData({ services: updatedServices });
    };

    const getValue = (name: string, key: keyof WalletFundingService) => {
        const service = data.services.find((s) => s.name === name);
        return service ? service[key] : undefined;
    };

    return (
        <form onSubmit={submit} className="flex h-full w-full flex-col justify-center p-3">
            {editData.map((service, i) => (
                <FundingMethod key={i} handleChange={handleChange} active={getValue(service.name, 'active') as number | boolean} service={service} />
            ))}

            <div className="mt-4 flex items-center justify-end">
                <Button type="submit" disabled={processing}>
                    Update
                </Button>
            </div>
        </form>
    );
}

interface FundingMethodProps {
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    service: WalletFundingService;
    active: number | boolean;
}

function FundingMethod({ handleChange, service, active }: FundingMethodProps) {
    return (
        <div className="mt-4">
            <div className="flex w-full p-2">
                <span className="mr-auto flex w-full font-medium">{service.name}: </span>
                <span className="ml-auto flex">
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
