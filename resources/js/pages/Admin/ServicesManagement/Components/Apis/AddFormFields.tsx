import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import * as Yup from 'yup';

interface AddFormFieldsProps {
    handleClose: () => void;
}

type AddApiFormData = {
    name: string;
    url: string;
    token: string;
    password: string;
    username: string;
    model: string;
    mtn_service_id: string;
    airtel_service_id: string;
    glo_service_id: string;
    ninemobile_service_id: string;
};

const API_TYPE_OPTIONS = [
    {
        value: 'APIs\\ArewaGlobal\\',
        name: 'Arewa Global (Smile)',
    },
    {
        value: 'APIs\\Default\\',
        name: 'MSORG',
    },
    {
        value: 'APIs\\ADE\\',
        name: 'ADE Developers',
    },
    {
        value: 'APIs\\VtPass\\',
        name: 'VtPass',
    },
    {
        value: 'APIs\\Autofy\\',
        name: 'Autofy',
    },
    {
        value: 'APIs\\Ogdams\\',
        name: 'OGDAMS',
    },
    {
        value: 'APIs\\SmartTech\\',
        name: 'SmartTech',
    },
    {
        value: 'APIs\\Simserver\\',
        name: 'Simserver',
    },
    {
        value: 'APIs\\AutoPilot\\',
        name: 'AutoPilot',
    },
    {
        value: 'APIs\\EasyAccess\\',
        name: 'EasyAccess',
    },
    {
        value: 'APIs\\Boltnet\\',
        name: 'Boltnet',
    },
    {
        value: 'APIs\\Accelerate\\',
        name: 'Accelerate (iStrategyTech)',
    },
] as const;

export default function AddFormFields({ handleClose }: AddFormFieldsProps) {
    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Api Id is required'),
    });

    const { data, setData, post, processing, setError, errors } = useForm<AddApiFormData>({
        name: '',
        url: '',
        token: '',
        password: '',
        username: '',
        model: '',
        mtn_service_id: '',
        airtel_service_id: '',
        glo_service_id: '',
        ninemobile_service_id: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        validationSchema
            .validate(data, { abortEarly: false })
            .then(() => {
                post(route('transaction_apis.store'), {
                    onSuccess: () => {
                        toast.success('API Registered Successfully', {
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
                });
            })
            .catch((err) => {
                const formattedErrors = err?.inner?.reduce((acc: Record<string, string>, curr: { path: string; message: string }) => {
                    acc[curr.path] = curr.message;
                    return acc;
                }, {});
                setError(formattedErrors);
            });
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setData(name as keyof AddApiFormData, value);
    };

    return (
        <form onSubmit={submit} className="flex w-full flex-col justify-center p-3">
            <div className="space-y-1.5">
                <Label htmlFor="model">API Type</Label>
                <Select value={data.model || ''} onValueChange={(value) => setData('model', value)}>
                    <SelectTrigger id="model" className="h-8 w-40">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Select</SelectItem>
                        {API_TYPE_OPTIONS.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="mt-4 space-y-1.5">
                <Label htmlFor="name">API name</Label>
                <Input
                    id="name"
                    type="text"
                    className="h-8 w-40"
                    name="name"
                    value={data.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.name)}
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            {data.model === 'APIs\\VtPass\\' || data.model === 'APIs\\Accelerate\\' ? (
                <>
                    <div className="mt-4 space-y-1.5">
                        <Label htmlFor="url">API Url</Label>
                        <Input
                            id="url"
                            type="text"
                            className="h-8 w-40"
                            name="url"
                            value={data.url}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.url)}
                            placeholder={data.model === 'APIs\\Accelerate\\' ? 'https://prod.airtime-data.irechargetech.com/api/v2' : ''}
                        />
                        <InputError message={errors.url} className="mt-2" />
                    </div>

                    <div className="mt-4 space-y-1.5">
                        <Label htmlFor="username">
                            {data.model === 'APIs\\Accelerate\\' ? 'Public Key' : 'Username'}
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            className="h-8 w-40"
                            name="username"
                            value={data.username}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.username)}
                        />
                        <InputError message={errors.username} className="mt-2" />
                    </div>

                    <div className="mt-4 space-y-1.5">
                        <Label htmlFor="password">
                            {data.model === 'APIs\\Accelerate\\' ? 'Private Key' : 'Password'}
                        </Label>
                        <Input
                            id="password"
                            type="text"
                            className="h-8 w-40"
                            name="password"
                            value={data.password}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.password)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>
                </>
            ) : (
                <>
                    <div className="mt-4 space-y-1.5">
                        <Label htmlFor="url">API Url</Label>
                        <Input
                            id="url"
                            type="text"
                            className="h-8 w-40"
                            name="url"
                            value={data.url}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.url)}
                        />
                        <InputError message={errors.url} className="mt-2" />
                    </div>

                    <div className="mt-4 space-y-1.5">
                        <Label htmlFor="token">API Token / Key</Label>
                        <Input
                            id="token"
                            type="text"
                            className="h-8 w-40"
                            name="token"
                            value={data.token}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.token)}
                        />
                        <InputError message={errors.token} className="mt-2" />
                    </div>
                </>
            )}

            <span className="my-4 flex w-full truncate border-b text-center text-lg font-medium">Networks Ids</span>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="mtn_service_id">MTN</Label>
                    <Input
                        id="mtn_service_id"
                        type="text"
                        className="h-8 w-40"
                        name="mtn_service_id"
                        value={data.mtn_service_id}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.mtn_service_id)}
                    />
                    <InputError message={errors.mtn_service_id} className="mt-2" />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="airtel_service_id">AIRTEL</Label>
                    <Input
                        id="airtel_service_id"
                        type="text"
                        className="h-8 w-40"
                        name="airtel_service_id"
                        value={data.airtel_service_id}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.airtel_service_id)}
                    />
                    <InputError message={errors.airtel_service_id} className="mt-2" />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="glo_service_id">GLO</Label>
                    <Input
                        id="glo_service_id"
                        type="text"
                        className="h-8 w-40"
                        name="glo_service_id"
                        value={data.glo_service_id}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.glo_service_id)}
                    />
                    <InputError message={errors.glo_service_id} className="mt-2" />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="ninemobile_service_id">9MOBILE</Label>
                    <Input
                        id="ninemobile_service_id"
                        type="text"
                        className="h-8 w-40"
                        name="ninemobile_service_id"
                        value={data.ninemobile_service_id}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.ninemobile_service_id)}
                    />
                    <InputError message={errors.ninemobile_service_id} className="mt-2" />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
                <Button type="submit" disabled={processing}>
                    Submit
                </Button>
            </div>
        </form>
    );
}
