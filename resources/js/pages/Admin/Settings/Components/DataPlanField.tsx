import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

interface EditData {
    id?: number;
    network_id?: string | number;
    plan_size?: string | number;
    name?: string;
    plan_volume?: string;
    plan_validity?: string | number;
    amount?: string | number;
    smart_earner_amount?: string | number;
    affiliate_amount?: string | number;
    top_user_amount?: string | number;
    api_amount?: string | number;
    api_plan_id?: string;
    data_plan_type_id?: string | number;
    api_ids?: { transaction_api_id: number; product_id?: string; product_code?: string }[];
    active?: boolean;
    enable_custom_vending_api?: boolean;
    custom_api_vending_id?: string;
}

interface MobileNetwork {
    id: number;
    name: string;
}

interface Api {
    id: number;
    name: string;
}

interface DataPlanType {
    id: number;
    name: string;
}

interface PageProps {
    mobile_networks: MobileNetwork[];
    apis: Api[];
    isStl?: boolean;
}

interface DataPlanFieldProps {
    handleClose: () => void;
    editData: EditData | null;
}

export default function DataPlanField({ handleClose, editData }: DataPlanFieldProps) {
    const { mobile_networks, apis, isStl } = usePage().props as unknown as PageProps;
    const [dataPlanTypes, setDataPlanTypes] = useState<DataPlanType[]>([]);

    const validationSchema = Yup.object().shape({
        plan_size: Yup.string().required('Plan Size is required'),
    });

    const { data, setData, post, put, processing, setError, errors } = useForm({
        mobile_network_id: editData?.network_id ?? '',
        plan_size: editData?.plan_size ?? '',
        name: editData?.name ?? '',
        plan_volume: editData?.plan_volume ?? '',
        plan_validity: editData?.plan_validity ?? '',
        amount: editData?.amount ?? '',
        smart_earner_amount: editData?.smart_earner_amount ?? '',
        affiliate_amount: editData?.affiliate_amount ?? '',
        top_user_amount: editData?.top_user_amount ?? '',
        api_amount: editData?.api_amount ?? '',
        api_plan_id: editData?.api_plan_id ?? '',
        data_plan_type_id: editData?.data_plan_type_id ?? '',
        api_ids: editData?.api_ids ?? [],
        active: editData?.active ?? true,
        enable_custom_vending_api: editData?.enable_custom_vending_api ?? false,
        custom_api_vending_id: editData?.custom_api_vending_id ?? '',
    });

    const handleFilterPlanTypes = async (value: string) => {
        const response = await fetch(
            `/buy_data/filter_data_plan_types?mobile_network_id=${value}`,
        );
        const res = await response.json();
        setDataPlanTypes(res.data_plan_types ?? []);
        setData('mobile_network_id', value);
    };

    useEffect(() => {
        if (editData?.network_id != null) {
            handleFilterPlanTypes(String(editData.network_id));
        }
    }, [editData?.network_id]);

    const getValue = (id: number, key: string) => {
        const api = data.api_ids.find((aid: { transaction_api_id: number }) => aid.transaction_api_id === id);
        return api ? (api as Record<string, string>)[key] ?? '' : '';
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const updatedApiId = [...data.api_ids];
        const product_id = e.target.value;
        const transaction_api_id = Number(e.target.id);
        const existingIndex = updatedApiId.findIndex(
            (api: { transaction_api_id: number }) => api.transaction_api_id === transaction_api_id,
        );
        if (existingIndex !== -1) {
            updatedApiId[existingIndex] = {
                ...updatedApiId[existingIndex],
                product_id: isNaN(Number(product_id)) ? '1' : product_id,
                product_code: product_id,
            };
        } else {
            updatedApiId.push({
                id: transaction_api_id,
                product_id: product_id,
                product_code: product_id,
                transaction_api_id,
            } as (typeof updatedApiId)[0]);
        }
        setData('api_ids', updatedApiId);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        validationSchema
            .validate(data, { abortEarly: false })
            .then(() => {
                if (editData != null && editData.id) {
                    put(route('data_plans.update', { data_plan: editData.id }), {
                        onSuccess: () => {
                            toast.success('Data Plan Updated Successfully');
                            handleClose();
                        },
                        onError: (errs) => {
                            Object.values(errs)
                                .flat()
                                .map((err) => toast.error(String(err)));
                        },
                    });
                } else {
                    post(route('data_plans.store'), {
                        onSuccess: () => {
                            toast.success('Data Plan Added Successfully');
                            handleClose();
                        },
                        onError: (errs) => {
                            Object.values(errs)
                                .flat()
                                .map((err) => toast.error(String(err)));
                        },
                    });
                }
            })
            .catch((err) => {
                const formattedErrors = err?.inner?.reduce(
                    (acc: Record<string, string>, curr: { path?: string; message: string }) => {
                        if (curr.path) acc[curr.path] = curr.message;
                        return acc;
                    },
                    {},
                );
                setError(formattedErrors);
            });
    };

    return (
        <form onSubmit={submit} className="flex w-full flex-col justify-center gap-4 p-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="mobile_network_id">Select Network Type</Label>
                    <Select
                        value={data.mobile_network_id || 'none'}
                        onValueChange={(v) => (v === 'none' ? setData('mobile_network_id', '') : handleFilterPlanTypes(v))}
                    >
                        <SelectTrigger id="mobile_network_id">
                            <SelectValue placeholder="Select Network" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Select Network</SelectItem>
                            {mobile_networks.map((network) => (
                                <SelectItem key={network.id} value={String(network.id)}>
                                    {network.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="data_plan_type_id">Select Plan Type</Label>
                    <Select
                        value={data.data_plan_type_id || 'none'}
                        onValueChange={(v) => setData('data_plan_type_id', v === 'none' ? '' : v)}
                    >
                        <SelectTrigger id="data_plan_type_id">
                            <SelectValue placeholder="Select Plan Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Select Plan Type</SelectItem>
                            {dataPlanTypes.map((planType) => (
                                <SelectItem key={planType.id} value={String(planType.id)}>
                                    {planType.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                />
                <InputError message={errors.name} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="plan_size">Plan Size</Label>
                    <Input
                        id="plan_size"
                        type="number"
                        value={data.plan_size}
                        onChange={(e) => setData('plan_size', e.target.value)}
                        aria-invalid={Boolean(errors.plan_size)}
                    />
                    <InputError message={errors.plan_size} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="plan_volume">Select Plan Volume</Label>
                    <Select
                        value={data.plan_volume || 'none'}
                        onValueChange={(v) => setData('plan_volume', v === 'none' ? '' : v)}
                    >
                        <SelectTrigger id="plan_volume">
                            <SelectValue placeholder="Select Volume" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Select Volume</SelectItem>
                            <SelectItem value="mb">MB</SelectItem>
                            <SelectItem value="gb">GB</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="plan_validity">Plan Validity</Label>
                <Input
                    id="plan_validity"
                    type="text"
                    value={data.plan_validity}
                    onChange={(e) => setData('plan_validity', e.target.value)}
                    aria-invalid={Boolean(errors.plan_validity)}
                />
                <InputError message={errors.plan_validity} />
            </div>

            <div className="space-y-4 border-t pt-4">
                <h3 className="border-b border-blue-500 pb-2 text-lg font-medium text-blue-600 dark:text-blue-400">
                    Pricing Configuration
                </h3>
                <div className="space-y-2">
                    <Label htmlFor="amount">Default Amount (₦)</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="₦ Amount"
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                    />
                    <InputError message={errors.amount} />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="smart_earner_amount">Smart Earner Amount (₦)</Label>
                        <Input
                            id="smart_earner_amount"
                            type="number"
                            placeholder="₦ Smart Earner Amount"
                            value={data.smart_earner_amount ?? data.amount}
                            onChange={(e) => setData('smart_earner_amount', e.target.value)}
                        />
                        <InputError message={errors.smart_earner_amount} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="affiliate_amount">Affiliate Amount (₦)</Label>
                        <Input
                            id="affiliate_amount"
                            type="number"
                            placeholder="₦ Affiliate Amount"
                            value={data.affiliate_amount ?? data.amount}
                            onChange={(e) => setData('affiliate_amount', e.target.value)}
                        />
                        <InputError message={errors.affiliate_amount} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="top_user_amount">Top User Amount (₦)</Label>
                        <Input
                            id="top_user_amount"
                            type="number"
                            placeholder="₦ Top User Amount"
                            value={data.top_user_amount ?? data.amount}
                            onChange={(e) => setData('top_user_amount', e.target.value)}
                        />
                        <InputError message={errors.top_user_amount} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="api_amount">API Amount (₦)</Label>
                        <Input
                            id="api_amount"
                            type="number"
                            placeholder="₦ API Amount"
                            value={data.api_amount ?? data.amount}
                            onChange={(e) => setData('api_amount', e.target.value)}
                        />
                        <InputError message={errors.api_amount} />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="api_plan_id">Default API Plan ID</Label>
                <Input
                    id="api_plan_id"
                    type="text"
                    value={data.api_plan_id}
                    onChange={(e) => setData('api_plan_id', e.target.value)}
                    aria-invalid={Boolean(errors.api_plan_id)}
                />
                <InputError message={errors.api_plan_id} />
            </div>

            {isStl && (
                <div className="space-y-4 border-t pt-4">
                    <h3 className="border-b border-blue-500 pb-2 text-lg font-medium text-blue-600 dark:text-blue-400">
                        API Configuration
                    </h3>
                    <div className="flex flex-wrap gap-6 py-4">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={data.active}
                                onCheckedChange={(checked) => setData('active', checked)}
                            />
                            <Label className="text-sm font-medium">Plan Status</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={data.enable_custom_vending_api}
                                onCheckedChange={(checked) =>
                                    setData('enable_custom_vending_api', checked)
                                }
                            />
                            <Label className="text-sm font-medium">Enable Custom Vending API</Label>
                        </div>
                    </div>
                    {data.enable_custom_vending_api && (
                        <div className="space-y-2">
                            <Label htmlFor="custom_api_vending_id">Custom API Vending</Label>
                            <Select
                                value={data.custom_api_vending_id || 'none'}
                                onValueChange={(v) =>
                                    setData('custom_api_vending_id', v === 'none' ? '' : v)
                                }
                            >
                                <SelectTrigger id="custom_api_vending_id">
                                    <SelectValue placeholder="Select API" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Select API</SelectItem>
                                    {apis.map((api) => (
                                        <SelectItem key={api.id} value={String(api.id)}>
                                            {api.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {apis.map((api) => (
                            <div key={api.id} className="space-y-2">
                                <Label htmlFor={`api-${api.id}`}>{api.name}</Label>
                                <Input
                                    id={String(api.id)}
                                    type="text"
                                    value={getValue(api.id, 'product_code')}
                                    onChange={handleChange}
                                    onBlur={handleChange}
                                    aria-invalid={Boolean(errors.api_plan_id)}
                                />
                                <InputError message={errors.api_plan_id} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={processing}>
                    Submit
                </Button>
            </div>
        </form>
    );
}
