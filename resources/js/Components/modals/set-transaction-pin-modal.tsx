import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useRef, useState } from 'react';

interface SetTransactionPinModalProps {
    open: boolean;
}

export function SetTransactionPinModal({ open }: SetTransactionPinModalProps) {
    const [step, setStep] = useState<'set' | 'confirm'>('set');
    const [mismatch, setMismatch] = useState(false);

    const pinRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];
    const confirmRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    const { data, setData, put, processing, errors, reset } = useForm({
        pin: '',
        pin_confirmation: '',
    });

    const handlePinDigit = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const digits = data.pin.split('');
        digits[index] = digit;
        const next = digits.join('').slice(0, 4);
        setData('pin', next);
        if (digit && index < 3) pinRefs[index + 1].current?.focus();
    };

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            const digits = data.pin.split('');
            if (!digits[index] && index > 0) pinRefs[index - 1].current?.focus();
            digits[index] = '';
            setData('pin', digits.join('').slice(0, 4));
        }
    };

    const handleConfirmDigit = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const digits = data.pin_confirmation.split('');
        digits[index] = digit;
        const next = digits.join('').slice(0, 4);
        setData('pin_confirmation', next);
        setMismatch(false);
        if (digit && index < 3) confirmRefs[index + 1].current?.focus();
    };

    const handleConfirmKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            const digits = data.pin_confirmation.split('');
            if (!digits[index] && index > 0) confirmRefs[index - 1].current?.focus();
            digits[index] = '';
            setData('pin_confirmation', digits.join('').slice(0, 4));
            setMismatch(false);
        }
    };

    const handleNext = () => {
        if (data.pin.length < 4) return;
        setStep('confirm');
        setMismatch(false);
        setData('pin_confirmation', '');
        setTimeout(() => confirmRefs[0].current?.focus(), 80);
    };

    const handleSubmit = () => {
        if (data.pin_confirmation.length < 4) return;
        if (data.pin !== data.pin_confirmation) {
            setMismatch(true);
            setData('pin_confirmation', '');
            confirmRefs[0].current?.focus();
            return;
        }
        setMismatch(false);
        put(route('pin.update'), {
            preserveScroll: true,
            onError: () => {
                setStep('set');
                reset();
                setTimeout(() => pinRefs[0].current?.focus(), 80);
            },
        });
    };

    const goBack = () => {
        setStep('set');
        setData('pin_confirmation', '');
        setMismatch(false);
        setTimeout(() => pinRefs[0].current?.focus(), 80);
    };

    const inputBase =
        'h-14 w-14 rounded-xl border-2 bg-white text-center text-2xl font-bold text-gray-900 shadow-sm transition-colors focus:outline-none dark:bg-gray-800 dark:text-white';
    const inputDefault = 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:focus:border-blue-400';
    const inputError = 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-500';

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent
                className="sm:max-w-sm"
                hideCloseButton
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="items-center space-y-3 pb-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
                        {step === 'set' ? (
                            <KeyRound className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <ShieldCheck className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        )}
                    </div>
                    <DialogTitle className="text-center text-xl font-semibold">
                        {step === 'set' ? 'Set Transaction PIN' : 'Confirm Your PIN'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-gray-500 dark:text-gray-400">
                        {step === 'set'
                            ? 'Create a 4-digit PIN to secure your transactions. You will need this PIN every time you make a payment.'
                            : 'Re-enter your PIN to confirm it matches.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {step === 'set' ? (
                        <div className="space-y-4">
                            <div className="flex justify-center gap-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <input
                                        key={i}
                                        ref={pinRefs[i]}
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={data.pin[i] || ''}
                                        aria-label={`PIN digit ${i + 1}`}
                                        title={`PIN digit ${i + 1}`}
                                        autoFocus={i === 0}
                                        onChange={(e) => handlePinDigit(i, e.target.value)}
                                        onKeyDown={(e) => handlePinKeyDown(i, e)}
                                        className={`${inputBase} ${inputDefault}`}
                                    />
                                ))}
                            </div>
                            {errors.pin && <p className="text-center text-xs text-red-500">{errors.pin}</p>}
                            <Button
                                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                disabled={data.pin.length < 4 || processing}
                                onClick={handleNext}
                            >
                                Continue
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-center gap-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <input
                                        key={i}
                                        ref={confirmRefs[i]}
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={data.pin_confirmation[i] || ''}
                                        aria-label={`Confirm PIN digit ${i + 1}`}
                                        title={`Confirm PIN digit ${i + 1}`}
                                        onChange={(e) => handleConfirmDigit(i, e.target.value)}
                                        onKeyDown={(e) => handleConfirmKeyDown(i, e)}
                                        className={`${inputBase} ${mismatch ? inputError : inputDefault}`}
                                    />
                                ))}
                            </div>

                            {mismatch && (
                                <p className="text-center text-xs font-medium text-red-500">PINs do not match. Please try again.</p>
                            )}
                            {errors.pin_confirmation && (
                                <p className="text-center text-xs text-red-500">{errors.pin_confirmation}</p>
                            )}

                            <Button
                                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                disabled={data.pin_confirmation.length < 4 || processing}
                                onClick={handleSubmit}
                            >
                                {processing ? 'Saving...' : 'Set PIN'}
                            </Button>

                            <button
                                type="button"
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                onClick={goBack}
                            >
                                ← Change PIN
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
