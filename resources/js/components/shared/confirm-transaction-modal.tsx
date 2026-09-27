import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, KeyRound, Loader2, XCircle } from 'lucide-react';
import { MouseEvent, useEffect, useRef, useState } from 'react';

interface StatusState {
    type: '' | 'error' | 'success';
    message: string;
    title: string;
}

interface ConfirmTransactionModalProps {
    message: string;
    validateForm: (onValid: () => void) => void;
    resetStatus: () => void;
    processing: boolean;
    title: string;
    status: StatusState;
    ariaLabel?: string;
    handleSubmit: () => void;
    detailsRows?: { label: string; value: string | number }[];
    requirePin?: boolean;
    onPinChange?: (pin: string) => void;
    pinError?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors?: Record<string, any>;
}

export default function ConfirmTransactionModal({
    message,
    validateForm,
    resetStatus,
    processing,
    title,
    status,
    ariaLabel,
    handleSubmit,
    detailsRows,
    requirePin = false,
    onPinChange,
    pinError,
}: ConfirmTransactionModalProps) {
    const [open, setOpen] = useState(false);
    const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
    const autoSubmitLockRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleSubmitRef = useRef(handleSubmit);
    const onPinChangeRef = useRef(onPinChange);
    const pinRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    useEffect(() => {
        handleSubmitRef.current = handleSubmit;
    }, [handleSubmit]);

    useEffect(() => {
        onPinChangeRef.current = onPinChange;
    }, [onPinChange]);

    const currentMessage = status.type === '' ? message : status.message;
    const isPinComplete = pinDigits.every((d) => d.length === 1 && /^\d$/.test(d));

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const resetPin = () => {
        setPinDigits(['', '', '', '']);
        autoSubmitLockRef.current = false;
        clearTimer();
        onPinChangeRef.current?.('');
    };

    // When a PIN error comes back from the server, clear inputs and refocus
    useEffect(() => {
        if (pinError) {
            setPinDigits(['', '', '', '']);
            autoSubmitLockRef.current = false;
            clearTimer();
            onPinChangeRef.current?.('');
            setTimeout(() => pinRefs[0].current?.focus(), 50);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pinError]);

    const onTriggerClick = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        validateForm(() => {
            setOpen(true);
            if (requirePin) {
                setTimeout(() => pinRefs[0].current?.focus(), 100);
            }
        });
    };

    const handleDialogChange = (nextOpen: boolean) => {
        if (processing) return;
        if (!nextOpen) {
            setOpen(false);
            resetStatus();
            resetPin();
        } else {
            setOpen(true);
        }
    };

    const handleCancel = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        resetStatus();
        resetPin();
    };

    const handleConfirm = (e?: MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (processing) return;

        if (requirePin && !isPinComplete) {
            const emptyIndex = pinDigits.findIndex((d) => !d);
            pinRefs[emptyIndex !== -1 ? emptyIndex : 0].current?.focus();
            return;
        }

        clearTimer();
        autoSubmitLockRef.current = true;
        handleSubmitRef.current();
    };

    const handleCloseAfterStatus = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        resetStatus();
        resetPin();
    };

    const handlePinDigit = (index: number, value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length > 1) {
            const digits = [...pinDigits];
            for (let i = 0; i < cleaned.length && index + i < 4; i++) {
                digits[index + i] = cleaned[i];
            }
            setPinDigits(digits);
            const newPin = digits.join('');
            onPinChangeRef.current?.(newPin);
            const nextFocus = Math.min(index + cleaned.length, 3);
            pinRefs[nextFocus].current?.focus();
            return;
        }

        const digit = cleaned.slice(-1);
        const digits = [...pinDigits];
        digits[index] = digit;
        setPinDigits(digits);
        const newPin = digits.join('');
        onPinChangeRef.current?.(newPin);

        if (digit && index < 3) {
            pinRefs[index + 1].current?.focus();
        }
    };

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            const digits = [...pinDigits];
            if (!digits[index] && index > 0) {
                pinRefs[index - 1].current?.focus();
            }
            digits[index] = '';
            const newPin = digits.join('');
            setPinDigits(digits);
            onPinChangeRef.current?.(newPin);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if (!pasted) return;

        const digits = ['', '', '', ''];
        for (let i = 0; i < pasted.length; i++) {
            digits[i] = pasted[i];
        }
        setPinDigits(digits);
        const newPin = digits.join('');
        onPinChangeRef.current?.(newPin);

        const focusIndex = Math.min(pasted.length, 3);
        pinRefs[focusIndex].current?.focus();
    };

    useEffect(() => {
        if (!isPinComplete || !open) {
            autoSubmitLockRef.current = false;
            clearTimer();
            return;
        }

        if (!requirePin || processing || status.type !== '') {
            clearTimer();
            return;
        }

        if (autoSubmitLockRef.current) {
            return;
        }

        autoSubmitLockRef.current = true;
        timerRef.current = setTimeout(() => {
            handleSubmitRef.current();
        }, 150);

        return () => {
            clearTimer();
        };
    }, [requirePin, open, processing, status.type, isPinComplete]);

    const renderStatusIcon = () => {
        if (status.type === '') return <AlertCircle className="h-10 w-10 text-yellow-500" />;
        if (status.type === 'error') return <XCircle className="h-10 w-10 text-red-500" />;
        if (status.type === 'success') return <CheckCircle2 className="h-10 w-10 text-green-500" />;
        return null;
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleDialogChange}>
                <DialogContent className="sm:max-w-md" aria-label={ariaLabel}>
                    <DialogHeader className="items-center space-y-3 border-b pb-4">
                        <div className="flex items-center justify-center">{renderStatusIcon()}</div>
                        <DialogTitle className="text-center text-2xl font-semibold text-gray-800 dark:text-gray-100">
                            {status.title || title}
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm text-gray-500 dark:text-gray-400">
                            {currentMessage}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Transaction summary rows */}
                        {detailsRows != null && detailsRows.length > 0 && status.type === '' && (
                            <div className="rounded-md border border-gray-200 dark:border-gray-700">
                                {detailsRows.map((row, index) => (
                                    <div
                                        key={row.label + index}
                                        className="flex items-center justify-between border-b border-gray-200 px-4 py-2 text-sm last:border-b-0 dark:border-gray-700"
                                    >
                                        <span className="text-gray-600 dark:text-gray-300">{row.label}</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* PIN entry */}
                        {requirePin && status.type === '' && !processing && (
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    <KeyRound size={13} />
                                    <span>Enter your 4-digit PIN to confirm</span>
                                </div>
                                <div className="flex justify-center gap-3">
                                    {[0, 1, 2, 3].map((i) => (
                                        <input
                                            key={i}
                                            ref={pinRefs[i]}
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={pinDigits[i]}
                                            aria-label={`PIN digit ${i + 1}`}
                                            title={`PIN digit ${i + 1}`}
                                            onChange={(e) => handlePinDigit(i, e.target.value)}
                                            onKeyDown={(e) => handlePinKeyDown(i, e)}
                                            onPaste={handlePaste}
                                            disabled={processing}
                                            className={`h-12 w-12 rounded-md border bg-white text-center text-lg font-bold text-gray-900 shadow-sm focus:outline-none dark:bg-gray-800 dark:text-white ${
                                                pinError
                                                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                    : 'border-gray-300 focus:border-[var(--theme-1,#3b82f6)] focus:ring-1 focus:ring-[var(--theme-1,#3b82f6)] dark:border-gray-600'
                                            }`}
                                        />
                                    ))}
                                </div>
                                {pinError && (
                                    <p className="text-center text-xs font-medium text-red-500">{pinError}</p>
                                )}
                            </div>
                        )}

                        {/* Processing spinner */}
                        {processing && (
                            <div className="flex flex-col items-center gap-3 py-2">
                                <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">Processing…</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        {status.type === '' && (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-theme-1 hover:bg-theme-1/90 text-white"
                                    onClick={handleConfirm}
                                    disabled={processing || (requirePin && !isPinComplete)}
                                >
                                    {processing ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        'Confirm'
                                    )}
                                </Button>
                            </>
                        )}

                        {/* After success/error: Close */}
                        {!processing && status.type !== '' && (
                            <Button type="button" onClick={handleCloseAfterStatus}>
                                Close
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Button type="button" className="bg-theme-1 hover:bg-theme-1/90 w-full text-white" onClick={onTriggerClick} disabled={processing}>
                {title}
            </Button>
        </>
    );
}
