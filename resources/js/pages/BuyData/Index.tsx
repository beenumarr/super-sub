import InputError from '@/components/input-error';
import ConfirmTransactionModal from '@/components/shared/confirm-transaction-modal';
import { NetworkProviderSelect } from '@/components/shared/network-provider-select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Phone } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

interface StatusState {
    type: '' | 'error' | 'success';
    message: string;
    title: string;
}

interface BuyDataForm {
    mobile_network: string | number;
    phone_number: string;
    amount: string | number;
    data_plan_id: string | number;
    data_plan_type: string | number;
    data_plan: any;
    disable_number_validator: boolean;
    transaction_pin: string;
}

interface BuyDataPageProps {
    auth: unknown;
}

export default function Index(props: BuyDataPageProps) {
    const [status, setStatus] = useState<StatusState>({
        type: '',
        message: '',
        title: '',
    });

    const { mobile_networks, data_plan_types } = usePage().props as {
        mobile_networks: any[];
        theme: string;
        data_plan_types: any[];
    };

    const [dataPlanTypes, setDataPlanTypes] = useState<any[]>([]);
    const [dataPlans, setDataPlans] = useState<any[]>([]);

    const validationSchema = Yup.object().shape({
        phone_number: Yup.string().required('Phone Number is required'),
        mobile_network: Yup.string().required('Please Select Network'),
        data_plan_id: Yup.string().required('Please Select Data Plan'),
    });

    const { data, setData, post, processing, setError, errors } = useForm<BuyDataForm>({
        mobile_network: '',
        phone_number: '',
        amount: '',
        data_plan_id: '',
        data_plan_type: '',
        data_plan: null,
        disable_number_validator: true,
        transaction_pin: '',
    });

    const validateForm = (handleValidated: () => void) => {
        validationSchema
            .validate(data, { abortEarly: false })
            .then(() => {
                handleValidated();
            })
            .catch((err: Yup.ValidationError) => {
                const formattedErrors = err.inner.reduce<Record<string, string>>((acc, curr) => {
                    if (curr.path) {
                        acc[curr.path] = curr.message;
                    }
                    return acc;
                }, {});
                setError(formattedErrors);
            });
    };

    const submit = () => {
        post(route('buy_data.store'), {
            onSuccess: () => {
                setStatus({
                    type: 'success',
                    title: 'Transaction Successful!',
                    message: 'Your data purchase has been completed successfully',
                });
            },
            onError: (formErrors: Record<string, any>) => {
                if (formErrors.amount) {
                    setStatus({
                        title: 'Transaction Failed!',
                        message: "You don't have sufficient balance!",
                        type: 'error',
                    });
                } else if (formErrors.status) {
                    setStatus({
                        title: 'Transaction Failed!',
                        message: formErrors.status as string,
                        type: 'error',
                    });
                } else {
                    Object.values(formErrors)
                        .flat()
                        .forEach((err: string) => toast.error(err));
                }
            },
        });
    };

    const handleFilterPlanTypes = (value: any) => {
        const planTypes = data_plan_types.filter((it) => it.mobile_network_id === value.id);

        setDataPlanTypes(planTypes);

        setData({
            ...data,
            mobile_network: value.id,
            data_plan_type: planTypes[0]?.id,
        });

        setDataPlans(planTypes[0]?.data_plans || []);
    };

    const handleFilterPlans = (value: any) => {
        const planType = data_plan_types.find((it) => it.id === value.id);
        setData('data_plan_type', value.id);
        setDataPlans(planType?.data_plans || []);
    };

    const confirmationDetails = data.data_plan
        ? [
              {
                  label: 'Plan',
                  value: `${data.data_plan.plan_size}${data.data_plan.plan_volume} (${data.data_plan.plan_validity})`,
              },
              {
                  label: 'Amount',
                  value: `₦${data.amount || 0}`,
              },
              {
                  label: 'Charges',
                  value: `₦0`,
              },
              {
                  label: 'Discount',
                  value: `₦0`,
              },
              {
                  label: 'Phone Number',
                  value: data.phone_number || '-',
              },
          ]
        : [];

    return (
        <AppLayout breadcrumbs={[{ title: 'Buy Data', href: '/buy_data' }]}>
            <Head title="Buy Data" />

            <div className="min-h-screen px-4 py-8">
                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-6 text-start">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Buy Data</h1>
                    </div>

                    {/* Main Card */}
                    <div className="bg-accent/40 border-border rounded-lg border p-4 shadow-sm">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            className="space-y-6"
                        >
                            {/* Network Selection */}
                            <NetworkProviderSelect
                                label="Network Provider"
                                networks={mobile_networks}
                                selectedId={data.mobile_network}
                                getId={(network) => network.id}
                                getName={(network) => network.name}
                                getIsActive={(network) => network.data_active}
                                onSelect={(network) => handleFilterPlanTypes(network)}
                                error={errors.mobile_network}
                            />

                            {/* Phone Number */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                                        <Phone className="text-theme-1 dark:text-gray-400" size={18} />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone_number"
                                        maxLength={11}
                                        value={data.phone_number}
                                        onFocus={() => setError('phone_number', '')}
                                        onChange={(e) => setData('phone_number', e.target.value)}
                                        placeholder="Enter phone number"
                                        className="focus:border-theme-1 focus:ring-theme-1 dark:focus:border-theme-1 dark:focus:ring-theme-1 border-border dark:bg-accent/40 w-full rounded-md border bg-white py-3.5 pr-4 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none dark:text-white dark:placeholder-gray-500"
                                    />
                                </div>
                                <InputError message={errors.phone_number} className="mt-2 text-xs text-red-500" />
                            </div>

                            {/* Disable Validator Toggle */}
                            <label className="flex cursor-pointer items-center gap-3">
                                <Switch
                                    checked={data.disable_number_validator}
                                    onCheckedChange={(checked) => setData('disable_number_validator', checked)}
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Disable Number Validator</span>
                            </label>

                            {/* Data Plan Types */}
                            {dataPlanTypes.length > 0 && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Plan Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {dataPlanTypes.map((planType, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleFilterPlans(planType)}
                                                className={`rounded-full border px-4 py-1.5 text-sm capitalize ${
                                                    data.data_plan_type === planType.id
                                                        ? 'border-theme-1 bg-theme-1/10 text-theme-1 dark:bg-accent/40 dark:text-white'
                                                        : 'hover:border-theme-1 hover:bg-theme-1/10 hover:text-theme-1 dark:hover:bg-theme-1/10 dark:hover:text-theme-1 border-border dark:bg-accent/40 d dark:border-slate-70 bg-white text-gray-700 dark:text-gray-100 dark:hover:border-slate-500'
                                                }`}
                                            >
                                                {planType.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Data Plans */}
                            {dataPlans.length > 0 && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Select Data Plan</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {dataPlans.map((plan, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    setData({
                                                        ...data,
                                                        data_plan_id: plan.id,
                                                        amount: plan.user_amount,
                                                        data_plan: plan,
                                                    });
                                                }}
                                                className={`rounded-md border p-3 text-left text-sm capitalize ${
                                                    data.data_plan_id === plan.id
                                                        ? 'border-theme-1 bg-theme-1/10 text-theme-1 dark:bg-accent/40 dark:text-white'
                                                        : 'hover:border-theme-1 hover:bg-theme-1/10 hover:text-theme-1 dark:hover:bg-theme-1/10 dark:hover:text-theme-1 border-border dark:bg-accent/40 bg-white text-gray-800 dark:border-slate-700 dark:text-gray-100 dark:hover:border-slate-500'
                                                }`}
                                            >
                                                <span className="block font-medium uppercase">
                                                    {plan.plan_size}
                                                    {plan.plan_volume}
                                                </span>
                                                <span className="mt-0.5 block text-xs text-gray-500 capitalize dark:text-gray-400">
                                                    {plan.plan_validity}
                                                </span>
                                                <span className="mt-1.5 block text-sm font-semibold">₦{plan.user_amount}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <InputError message={errors.data_plan_id} className="mt-2 text-xs text-red-500" />
                                </div>
                            )}

                            {/* Amount Display */}
                            {data.amount && (
                                <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Total Amount</span>
                                        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">₦{data.amount}</span>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button / Confirmation */}
                            <ConfirmTransactionModal
                                title="Purchase"
                                status={status}
                                errors={errors}
                                resetStatus={() =>
                                    setStatus({
                                        type: '',
                                        message: '',
                                        title: '',
                                    })
                                }
                                processing={processing}
                                message={`Are you sure you want to buy ${data.data_plan?.plan_size}${data.data_plan?.plan_volume} data for ₦${data?.amount} (${data.data_plan?.plan_validity}) to ${data.phone_number}?`}
                                handleSubmit={submit}
                                validateForm={validateForm}
                                detailsRows={confirmationDetails}
                                requirePin
                                onPinChange={(pin) => setData('transaction_pin', pin)}
                                pinError={errors.transaction_pin}
                            />
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
