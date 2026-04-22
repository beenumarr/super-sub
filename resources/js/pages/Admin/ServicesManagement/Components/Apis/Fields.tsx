import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import * as Yup from 'yup';

export interface TransactionApiEditData {
    id: number;
    model: string;
    name?: string | null;
    url?: string | null;
    token?: string | null;
    password?: string | null;
    username?: string | null;
    mtn_service_id?: string | null;
    airtel_service_id?: string | null;
    glo_service_id?: string | null;
    ninemobile_service_id?: string | null;
}

interface FieldProps {
    handleClose: () => void;
    editData: TransactionApiEditData;
}

type FieldFormData = {
    name: string;
    url: string;
    token: string;
    password: string;
    username: string;
    mtn_service_id: string;
    airtel_service_id: string;
    glo_service_id: string;
    ninemobile_service_id: string;
};

export default function Field({ handleClose, editData }: FieldProps) {
    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Api Id is required'),
    });

    const { data, setData, put, processing, setError, errors } = useForm<FieldFormData>({
        name: editData?.name ?? '',
        url: editData?.url ?? '',
        token: editData?.token ?? '',
        password: editData?.password ?? '',
        username: editData?.username ?? '',
        mtn_service_id: editData?.mtn_service_id ?? '',
        airtel_service_id: editData?.airtel_service_id ?? '',
        glo_service_id: editData?.glo_service_id ?? '',
        ninemobile_service_id: editData?.ninemobile_service_id ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        validationSchema
            .validate(data, { abortEarly: false })
            .then(() => {
                put(
                    route('transaction_apis.update', {
                        transaction_api: editData.id,
                    }),
                    {
                        onSuccess: () => {
                            toast.success('Configuration Updated Successfully', {
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
        setData(name as keyof FieldFormData, value);
    };

    const apiType = editData.model.replace('APIs\\', '').replace('\\', '');

    return (
        <form onSubmit={submit} className="flex w-full flex-col justify-center p-0">
            <div>
                <span>API Type: {apiType === 'Default' ? 'Msorg' : apiType}</span>
            </div>

            <div className="mt-4 space-y-1.5">
                <Label htmlFor="name">API name</Label>
                <Input
                    id="name"
                    type="text"
                    className="h-8 w-full"
                    name="name"
                    value={data.name}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.name)}
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            {editData.model === 'APIs\\VtPass\\' ? (
                <>
                    <div className="mt-4 space-y-1.5">
                        <Label htmlFor="url">API Url</Label>
                        <Input
                            id="url"
                            type="text"
                            className="h-8 w-full"
                            name="url"
                            value={data.url}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.url)}
                        />
                        <InputError message={errors.url} className="mt-2" />
                    </div>

                    <div className="mt-4 space-y-1.5">
                        <Label htmlFor="username">Username (Optional)</Label>
                        <Input
                            id="username"
                            type="text"
                            className="h-8 w-full"
                            name="username"
                            value={data.username}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.username)}
                        />
                        <InputError message={errors.username} className="mt-2" />
                    </div>

                    <div className="mt-4 space-y-1.5">
                        <Label htmlFor="password">Password (Optional)</Label>
                        <Input
                            id="password"
                            type="text"
                            className="h-8 w-full"
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
                            className="h-8 w-full"
                            name="url"
                            value={data.url}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.url)}
                        />
                        <InputError message={errors.url} className="mt-2" />
                    </div>

                    <div className="mt-4 space-y-1.5">
                        <Label htmlFor="token">API Token / Key (Optional)</Label>
                        <Input
                            id="token"
                            type="text"
                            className="h-8 w-full"
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
                        className="h-8 w-full"
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
                        className="h-8 w-full"
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
                        className="h-8 w-full"
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
                        className="h-8 w-full"
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
                    Update
                </Button>
            </div>
        </form>
    );
}
