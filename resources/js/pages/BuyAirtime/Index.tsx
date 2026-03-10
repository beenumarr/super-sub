import InputError from '@/components/input-error';
import ConfirmTransactionModal from '@/components/shared/confirm-transaction-modal';
import { NetworkProviderSelect } from '@/components/shared/network-provider-select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

interface StatusState {
    type: '' | 'error' | 'success';
    message: string;
    title: string;
}

interface BuyAirtimeForm {
    mobile_network: string | number;
    phone_number: string;
    amount: string | number;
    payable_amount: string | number;
    disable_number_validator: boolean;
    discount?: number;
}

interface BuyAirtimePageProps {
    auth: unknown;
}

export default function Index(props: BuyAirtimePageProps) {
    const [status, setStatus] = useState<StatusState>({ type: '', message: '', title: '' });
    const { mobile_networks } = usePage().props as {
        mobile_networks: any[];
    };

    const { data, setData, post, processing, setError, errors } = useForm<BuyAirtimeForm>({
        mobile_network: '',
        phone_number: '',
        amount: '',
        payable_amount: '',
        disable_number_validator: false,
        discount: 0,
    });

    const validationSchema = Yup.object().shape({
        phone_number: Yup.string().required('Phone Number is required').max(11),
        mobile_network: Yup.string().required('Please Select Network Provider!'),
        amount: Yup.string().required('Please Amount is Required'),
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
        post(route('buy_airtime.store'), {
            onSuccess: () => {
                setStatus({
                    type: 'success',
                    title: 'Transaction Successful!',
                    message: 'Your airtime purchase has been completed successfully',
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

    const applyPackageDiscount = (amountToPay: number) => {
        const addon = mobile_networks.find((ntwk) => ntwk.id === data.mobile_network)?.user_discount;

        let newAmount = amountToPay;

        if (addon) {
            const amount = addon.amount;
            const amountType = addon.amount_type;
            const type = addon.type;

            let discountedAmount = amount;

            if (amountType === 'percentage') {
                discountedAmount = amountToPay * (amount / 100);
            }

            if (type === 'discount') {
                newAmount = amountToPay - discountedAmount;
            } else if (type === 'charge') {
                newAmount = amountToPay + discountedAmount;
            }

            setData({
                ...data,
                payable_amount: newAmount,
                discount: discountedAmount,
            });
        } else {
            setData({
                ...data,
                payable_amount: amountToPay,
                discount: 0,
            });
        }
    };

    useEffect(() => {
        if (data.amount && data.mobile_network) {
            const numericAmount = Number(data.amount) || 0;
            if (numericAmount > 0) {
                applyPackageDiscount(numericAmount);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.amount, data.mobile_network]);

    const airtimeList = [
        { name: '100', amount: 100 },
        { name: '200', amount: 200 },
        { name: '500', amount: 500 },
        { name: '1000', amount: 1000 },
        { name: '2000', amount: 2000 },
        { name: '5000', amount: 5000 },
    ];

    const selectedNetwork = mobile_networks.find((ntwk) => ntwk.id === data.mobile_network);

    const confirmationDetails =
        data.amount && data.phone_number
            ? [
                  {
                      label: 'Plan',
                      value: selectedNetwork ? `${selectedNetwork.name} Airtime` : 'Airtime Top-up',
                  },
                  {
                      label: 'Amount',
                      value: `₦${data.amount || 0}`,
                  },
                  {
                      label: 'Charges',
                      value: '₦0',
                  },
                  {
                      label: 'Discount',
                      value: `₦${data.discount || 0}`,
                  },
                  {
                      label: 'Amount to Pay',
                      value: `₦${data.payable_amount || data.amount || 0}`,
                  },
                  {
                      label: 'Phone Number',
                      value: data.phone_number || '-',
                  },
              ]
            : [];

    return (
        <AppLayout breadcrumbs={[{ title: 'Buy Airtime', href: '/buy_airtime' }]}>
            <Head title="Buy Airtime" />

            <div className="min-h-screen px-4 py-8">
                <div className="mx-auto max-w-2xl">
                    {/* Header */}
                    <div className="mb-6 text-start">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Buy Airtime</h1>
                    </div>

                    {/* Main Card */}
                    <div className="bg-accent/40 border-border rounded-lg border p-4 shadow-sm">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                submit();
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
                                getIsActive={(network) => network.airtime_active}
                                onSelect={(network) => {
                                    setData('mobile_network', network.id);
                                    setError('mobile_network', '');
                                }}
                                error={errors.mobile_network}
                                centerError
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
                            {/* Custom Amount */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-gray-500">
                                        ₦
                                    </span>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={data.amount}
                                        onFocus={() => setError('amount', '')}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder="Enter amount"
                                        className="focus:border-theme-1 focus:ring-theme-1 dark:focus:border-theme-1 dark:focus:ring-theme-1 border-border dark:bg-accent/40 w-full rounded-md border bg-white py-3.5 pr-4 pl-8 text-sm text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none dark:text-white dark:placeholder-gray-500"
                                    />
                                </div>
                                <InputError message={errors.amount} className="mt-2 text-xs text-red-500" />
                            </div>

                            {/* Quick Amount Selection */}
                            <div>
                                <div className="grid grid-cols-3 gap-3">
                                    {airtimeList.map((opt, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                setData('amount', opt.amount);
                                                setError('amount', '');
                                            }}
                                            className={`rounded-md border px-3 py-3 text-center text-sm font-semibold ${
                                                Number(data.amount) === opt.amount
                                                    ? 'border-theme-1 bg-theme-1/10 text-theme-1 dark:bg-accent/40 dark:text-white'
                                                    : 'hover:border-theme-1 hover:bg-theme-1/10 hover:text-theme-1 dark:hover:bg-theme-1/10 dark:hover:text-theme-1 border-border dark:bg-accent/40 bg-white text-gray-800 dark:text-gray-100'
                                            }`}
                                        >
                                            ₦{opt.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Summary
                            {data.amount && (
                                <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                                    {data.discount && data.discount > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Discount</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">-₦{data.discount}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Amount to Pay</span>
                                        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                            ₦{data.payable_amount || data.amount}
                                        </span>
                                    </div>
                                </div>
                            )} */}

                            <div className="flex justify-center">
                                <ConfirmTransactionModal
                                    title="Purchase"
                                    status={status}
                                    resetStatus={() =>
                                        setStatus({
                                            type: '',
                                            message: '',
                                            title: '',
                                        })
                                    }
                                    processing={processing}
                                    message={`Are you sure you want to buy ₦${data?.amount} airtime for ${data.phone_number}?`}
                                    handleSubmit={submit}
                                    validateForm={validateForm}
                                    detailsRows={confirmationDetails}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
