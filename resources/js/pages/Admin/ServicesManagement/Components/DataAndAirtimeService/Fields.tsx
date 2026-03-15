import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import * as Yup from 'yup';

interface ApiDefinition {
    id: number;
    name: string;
}

interface PlanType {
    name: string;
}

interface EditData {
    id: number;
    name: string;
    api_network_id?: string | number | null;
    airtime_transaction_api_id?: string | number | null;
    data_active?: boolean;
    airtime_active?: boolean;
    plan_type_api_list?: Record<string, string | number | null>;
    plan_type_list?: Record<string, boolean>;
    plan_types?: PlanType[];
}

interface FieldProps {
    handleClose: () => void;
    editData: EditData;
}

type DataForm = {
    api_network_id: string;
    airtime_transaction_api_id: string;
    data_active: boolean;
    airtime_active: boolean;
    data_types_vending: Record<string, string>;
} & Record<string, string | boolean | Record<string, string>>;

export default function Field({ handleClose, editData }: FieldProps) {
    const { apis, isStl } = usePage().props as unknown as {
        apis: ApiDefinition[];
        isStl: boolean;
    };

    const validationSchema = Yup.object().shape({
        api_network_id: Yup.string().required('Api Id is required'),
    });

    const initialPlanTypeApiList: Record<string, string> = Object.fromEntries(
        Object.entries(editData?.plan_type_api_list ?? {}).map(([key, value]) => [
            key,
            value == null ? '' : String(value),
        ]),
    );

    const { data, setData, put, processing, setError, errors } = useForm<DataForm>({
        api_network_id: editData?.api_network_id != null ? String(editData.api_network_id) : '',
        airtime_transaction_api_id:
            editData?.airtime_transaction_api_id != null ? String(editData.airtime_transaction_api_id) : '',
        data_active: editData?.data_active ?? false,
        data_types_vending: initialPlanTypeApiList,
        airtime_active: editData?.airtime_active ?? false,
        ...(editData?.plan_type_list ?? {}),
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        validationSchema
            .validate(data, { abortEarly: false })
            .then(() => {
                put(
                    route('mobile_networks.update', {
                        mobile_network: editData.id,
                    }),
                    {
                        onSuccess: () => {
                            toast.success('Settings Updated Successfully', {
                                duration: 3000,
                            });
                            handleClose();
                        },
                        onError: (errs) => {
                            Object.values(errs)
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
        setData(name, value);
    };

    return (
        <form onSubmit={submit} className="flex w-full flex-col justify-center p-3">
            <div className="flex w-full p-2">
                <span className="mr-auto flex w-1/2">Network: </span>
                <span className="ml-auto flex w-1/2">{editData.name}</span>
            </div>

            <div className="flex w-full p-2">
                <span className="mr-auto flex w-1/2">API ID: </span>
                <span className="ml-auto flex w-1/2 flex-col">
                    <Input
                        id="api_id"
                        type="text"
                        className="h-8 w-40"
                        name="api_network_id"
                        value={data.api_network_id}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.api_network_id)}
                    />
                    <InputError message={errors.api_network_id} className="mt-2" />
                </span>
            </div>

            <div className="flex w-full p-2">
                <span className="mr-auto flex w-1/2">Data: </span>
                <span className="ml-auto flex w-1/2">
                    <label className="mr-auto flex items-center">
                        <Switch
                            checked={data.data_active}
                            onCheckedChange={(checked) => {
                                setData({
                                    ...data,
                                    data_active: checked,
                                });
                            }}
                        />
                        <span className="ml-2 text-sm text-gray-600">{data.data_active ? 'Active' : 'Disabled'}</span>
                    </label>
                </span>
            </div>

            <div className="flex w-full items-center gap-2 p-2">
                <span className="mt-4 mr-auto flex w-1/2">Airtime: </span>

                {isStl && (
                    <div className="mt-4 w-1/2">
                        <Label htmlFor="airtime_transaction_api_id">Vending Medium Api</Label>
                        <Select
                            value={data.airtime_transaction_api_id || 'none'}
                            onValueChange={(value) => {
                                setData({
                                    ...data,
                                    airtime_transaction_api_id: value === 'none' ? '' : value,
                                });
                            }}
                        >
                            <SelectTrigger id="airtime_transaction_api_id">
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

                <label className="mt-4 mr-auto flex items-center">
                    <Switch
                        checked={data.airtime_active}
                        onCheckedChange={(checked) => {
                            setData({
                                ...data,
                                airtime_active: checked,
                            });
                        }}
                    />
                    <span className="ml-2 text-sm text-gray-600">{data.airtime_active ? 'Active' : 'Disabled'}</span>
                </label>
            </div>

            <span className="flex w-full truncate border-b py-4 text-center text-xl font-medium">Data Plan Types</span>

            {editData?.plan_types?.map((item) => (
                <DataPlanType
                    key={item.name}
                    apis={apis}
                    setData={setData as (data: DataForm | ((prev: DataForm) => DataForm)) => void}
                    name={item.name}
                    data={data}
                    value={data[item.name] as boolean}
                    isStl={isStl}
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

interface DataPlanTypeProps {
    name: string;
    value: boolean;
    setData: (data: DataForm | ((prev: DataForm) => DataForm)) => void;
    data: DataForm;
    apis: ApiDefinition[];
    isStl: boolean;
}

function DataPlanType({ name, value, setData, data, apis, isStl }: DataPlanTypeProps) {
    return (
        <div className="flex w-full items-center gap-2 p-2 align-middle">
            <span className="mt-4 mr-auto flex w-1/2">{name}: </span>

            {isStl && (
                <div className="mt-4 w-1/2">
                    <Label htmlFor={`plan-${name}`}>Vending Medium Api</Label>
                    <Select
                        value={data.data_types_vending?.[name] || 'none'}
                        onValueChange={(value) => {
                            setData({
                                ...data,
                                data_types_vending: {
                                    ...data.data_types_vending,
                                    [name]: value === 'none' ? '' : value,
                                },
                            });
                        }}
                    >
                        <SelectTrigger id={`plan-${name}`}>
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

            <label className="mt-4 mr-auto flex items-center">
                <Switch
                    checked={value}
                    onCheckedChange={(checked) => {
                        setData({
                            ...data,
                            [name]: checked,
                        });
                    }}
                />
                <span className="ml-2 text-sm text-gray-600">{value ? 'Active' : 'Disabled'}</span>
            </label>
        </div>
    );
}
