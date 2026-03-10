import InputError from '@/components/input-error';
import ConfirmTransactionModal from '@/components/shared/confirm-transaction-modal';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import * as Yup from 'yup';

interface StatusState {
    type: '' | 'error' | 'success';
    message: string;
    title: string;
}

interface KycBvnFormData {
    bvn: string;
    phone: string;
    name: string;
}

interface KycBvnFormProps {
    className?: string;
}

export default function KycBvnForm({ className = '' }: KycBvnFormProps) {
    const [status, setStatus] = useState<StatusState>({
        type: '',
        message: '',
        title: '',
    });

    const validationSchema = Yup.object().shape({
        phone: Yup.string().required('Phone Number is required'),
        bvn: Yup.string().required('BVN Number is required'),
        name: Yup.string().required('Full Name is required'),
    });

    const { data, setData, patch, errors, setError, processing } = useForm<KycBvnFormData>({
        bvn: '',
        phone: '',
        name: '',
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
        patch(route('update-kyc-bvn'), {
            onSuccess: () => {
                setStatus({
                    type: 'success',
                    title: 'KYC Verification Successful!',
                    message: 'Your KYC verification has been successful.',
                });
            },
            onError: () => {
                setStatus({
                    title: 'KYC Verification Failed!',
                    message:
                        'Failed to retrieve BVN details, please check your details and try again.',
                    type: 'error',
                });
            },
        });
    };

    const confirmationDetails = [
        { label: 'Full Name', value: data.name || '-' },
        { label: 'BVN Number', value: data.bvn || '-' },
        { label: 'Phone Number', value: data.phone || '-' },
    ];

    return (
        <section className={className}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                }}
                className="mt-6 space-y-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
                <header className="border-b border-gray-200 pb-3 dark:border-slate-800">
                    <h1 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                        KYC Update with BVN
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Please enter your BVN and details below to validate your funding
                        accounts.
                    </p>
                </header>

                <div className="space-y-1">
                    <label
                        htmlFor="bvn"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        BVN Number
                    </label>
                    <Input
                        id="bvn"
                        value={data.bvn}
                        onChange={(e) => setData('bvn', e.target.value)}
                        type="text"
                        className="mt-1"
                    />
                    <InputError message={errors.bvn} className="mt-1" />
                </div>

                <div className="space-y-1">
                    <label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Full Name
                    </label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        type="text"
                        className="mt-1"
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div className="space-y-1">
                    <label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Phone Number
                    </label>
                    <Input
                        id="phone"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        type="text"
                        className="mt-1"
                    />
                    <InputError message={errors.phone} className="mt-1" />
                </div>

                <ConfirmTransactionModal
                    title="Submit"
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
                    message="Please confirm that the KYC details you have provided are correct."
                    handleSubmit={submit}
                    validateForm={validateForm}
                    detailsRows={confirmationDetails}
                />
            </form>
        </section>
    );
}

