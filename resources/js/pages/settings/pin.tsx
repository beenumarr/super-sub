import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction PIN',
        href: '/user-settings/pin',
    },
];

interface PinPageProps {
    hasPin: boolean;
    status?: string;
}

export default function Pin({ hasPin, status }: PinPageProps) {
    const currentPinRef = useRef<HTMLInputElement>(null);
    const pinRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, errors, processing, recentlySuccessful, reset } = useForm({
        current_pin: '',
        pin: '',
        pin_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('pin.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errs) => {
                if (errs.pin) {
                    reset('pin', 'pin_confirmation');
                    pinRef.current?.focus();
                }
                if (errs.current_pin) {
                    reset('current_pin');
                    currentPinRef.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction PIN" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Transaction PIN"
                        description={
                            hasPin
                                ? 'Update your 4-digit transaction PIN used to confirm payments'
                                : 'Set a 4-digit PIN to secure your transactions'
                        }
                    />

                    {status === 'pin-updated' && (
                        <div className="rounded-md bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Transaction PIN updated successfully.
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        {hasPin && (
                            <div className="grid gap-2">
                                <label htmlFor="current_pin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Current PIN
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                                        <KeyRound size={16} />
                                    </div>
                                    <input
                                        id="current_pin"
                                        ref={currentPinRef}
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={data.current_pin}
                                        onChange={(e) => setData('current_pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        placeholder="Enter current PIN"
                                        autoComplete="current-password"
                                        className="focus:border-theme-1 focus:ring-theme-1 border-border dark:bg-accent/40 w-full rounded-md border bg-white py-2.5 pr-4 pl-10 text-sm tracking-widest text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none dark:text-white dark:placeholder-gray-500"
                                    />
                                </div>
                                <InputError message={errors.current_pin} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <label htmlFor="pin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {hasPin ? 'New PIN' : 'PIN'}
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                                    <KeyRound size={16} />
                                </div>
                                <input
                                    id="pin"
                                    ref={pinRef}
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={data.pin}
                                    onChange={(e) => setData('pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="Enter 4-digit PIN"
                                    autoComplete="new-password"
                                    className="focus:border-theme-1 focus:ring-theme-1 border-border dark:bg-accent/40 w-full rounded-md border bg-white py-2.5 pr-4 pl-10 text-sm tracking-widest text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none dark:text-white dark:placeholder-gray-500"
                                />
                            </div>
                            <InputError message={errors.pin} />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="pin_confirmation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirm PIN
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                                    <KeyRound size={16} />
                                </div>
                                <input
                                    id="pin_confirmation"
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={data.pin_confirmation}
                                    onChange={(e) => setData('pin_confirmation', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="Confirm 4-digit PIN"
                                    autoComplete="new-password"
                                    className="focus:border-theme-1 focus:ring-theme-1 border-border dark:bg-accent/40 w-full rounded-md border bg-white py-2.5 pr-4 pl-10 text-sm tracking-widest text-gray-900 placeholder-gray-400 focus:ring-1 focus:outline-none dark:text-white dark:placeholder-gray-500"
                                />
                            </div>
                            <InputError message={errors.pin_confirmation} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>{hasPin ? 'Update PIN' : 'Set PIN'}</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
