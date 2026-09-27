import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, KeyRound, Loader2, Zap, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface ElectricityDistributor {
    id: number;
    name: string;
    code: string;
}

interface ElectricityBillProps {
    electricity_distributions: ElectricityDistributor[];
}

export default function ElectricityBill({ electricity_distributions }: ElectricityBillProps) {
    const [validating, setValidating] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
    const [transactionMessage, setTransactionMessage] = useState<string>('');
    const [validatedInfo, setValidatedInfo] = useState<{ name: string; address: string } | null>(null);
    const [pin, setPin] = useState('');
    const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    const { data, setData, post, processing, errors, reset } = useForm({
        disco_name: '',
        electricity_distributor_id: '',
        meter_number: '',
        meter_type: 'prepaid',
        amount: 0,
        name: '',
        phone_number: '',
        address: '',
        transaction_pin: '',
    });

    const handleDistributorChange = (discoId: string) => {
        const disco = electricity_distributions.find(d => d.id.toString() === discoId);
        if (disco) {
            setData({
                ...data,
                electricity_distributor_id: discoId,
                disco_name: disco.code,
            });
            setValidatedInfo(null);
        }
    };

    const validateMeter = async () => {
        if (!data.meter_number || !data.disco_name || !data.meter_type) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setValidating(true);
            const params = new URLSearchParams({
                meter_number: data.meter_number,
                disco_name: data.disco_name,
                meter_type: data.meter_type,
            });

            const response = await fetch(`/validate_meter?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Invalid meter number');
            }

            setValidatedInfo(result);
            setData({
                ...data,
                name: result.name,
                address: result.address,
            });
        } catch (error: any) {
            toast.error(error.message || 'Invalid meter number');
            setValidatedInfo(null);
            console.error('Validation error:', error);
        } finally {
            setValidating(false);
        }
    };

    const handleNextClick = async () => {
        // Validate required fields
        if (!data.meter_number || !data.electricity_distributor_id || !data.phone_number || !data.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (data.amount < 50) {
            toast.error('Minimum amount is ₦100');
            return;
        }

        // If not validated yet, validate first
        if (!validatedInfo) {
            await validateMeter();
        } else {
            // Show confirmation dialog
            setConfirmDialogOpen(true);
        }
    };

    const handleSubmit = () => {
        setTransactionStatus('processing');

        post(route('electricity_bill_payments.store'), {
            onSuccess: () => {
                setTransactionStatus('success');
                setTransactionMessage('Electricity bill payment successful!');
                reset();
                setPin('');
                setValidatedInfo(null);
                setTimeout(() => {
                    setConfirmDialogOpen(false);
                    setTransactionStatus('initial');
                }, 2000);
            },
            onError: (errs: any) => {
                setTransactionStatus('error');
                if (errs.transaction_pin) {
                    setTransactionMessage(errs.transaction_pin);
                } else if (errs.amount) {
                    setTransactionMessage('Insufficient balance');
                } else {
                    setTransactionMessage(Object.values(errs).flat().join(', '));
                }
            },
        });
    };

    const autoSubmitLockRef = useRef(false);
    const handleSubmitRef = useRef(handleSubmit);
    useEffect(() => {
        handleSubmitRef.current = handleSubmit;
    }, [handleSubmit]);

    useEffect(() => {
        if (pin.length !== 4 || !confirmDialogOpen) {
            autoSubmitLockRef.current = false;
            return;
        }
        if (processing || transactionStatus !== 'initial') {
            return;
        }
        if (autoSubmitLockRef.current) {
            return;
        }
        autoSubmitLockRef.current = true;
        const timer = setTimeout(() => {
            handleSubmitRef.current();
        }, 150);
        return () => clearTimeout(timer);
    }, [pin, confirmDialogOpen, processing, transactionStatus]);

    return (
        <AppLayout>
            <Head title="Electricity Bill Payment" />

            <div className="mx-auto w-full max-w-2xl px-4 py-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-6 w-6" />
                            Electricity Bill Payments
                        </CardTitle>
                        <CardDescription>
                            Pay your electricity bills for DSTV, EEDC, IBEDC, and other distributors
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Meter Type Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Meter Type *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setData('meter_type', 'prepaid')}
                                    className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                                        data.meter_type === 'prepaid'
                                            ? 'border-theme-1 bg-accent/40 text-theme-1'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-theme-1/50'
                                    }`}
                                >
                                    Prepaid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('meter_type', 'postpaid')}
                                    className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                                        data.meter_type === 'postpaid'
                                            ? 'border-theme-1 bg-accent/40 text-theme-1'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-theme-1/50'
                                    }`}
                                >
                                    Postpaid
                                </button>
                            </div>
                        </div>

                        {/* Distributor Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="distributor" className="text-base font-medium">
                                Electricity Distributor *
                            </Label>
                            <Select value={data.electricity_distributor_id} onValueChange={handleDistributorChange}>
                                <SelectTrigger id="distributor">
                                    <SelectValue placeholder="Select your distributor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {electricity_distributions.map((disco) => (
                                        <SelectItem key={disco.id} value={disco.id.toString()}>
                                            {disco.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.disco_name && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.disco_name}</p>
                            )}
                        </div>

                        {/* Meter Number */}
                        <div className="space-y-2">
                            <Label htmlFor="meter_number" className="text-base font-medium">
                                Meter Number *
                            </Label>
                            <Input
                                id="meter_number"
                                placeholder="Enter 11-digit meter number"
                                value={data.meter_number}
                                onChange={(e) => {
                                    setData('meter_number', e.target.value);
                                    setValidatedInfo(null);
                                }}
                                maxLength={13}
                                type="text"
                                className={errors.meter_number ? 'border-red-500' : ''}
                            />
                            {errors.meter_number && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.meter_number}</p>
                            )}
                        </div>

                        {/* Validation Status */}
                        {validating && (
                            <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-blue-700 dark:text-blue-300">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Validating meter number...</span>
                            </div>
                        )}

                        {validatedInfo && (
                            <div className="rounded-lg bg-accent/40 p-4 space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Customer Name:</span> {validatedInfo.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium">Address:</span> {validatedInfo.address}
                                </p>
                            </div>
                        )}

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phone_number" className="text-base font-medium">
                                Phone Number *
                            </Label>
                            <Input
                                id="phone_number"
                                placeholder="Enter phone number"
                                value={data.phone_number}
                                onChange={(e) => setData('phone_number', e.target.value)}
                                maxLength={11}
                                type="tel"
                                className={errors.phone_number ? 'border-red-500' : ''}
                            />
                            {errors.phone_number && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.phone_number}</p>
                            )}
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-base font-medium">
                                Amount (₦) *
                            </Label>
                            <Input
                                id="amount"
                                placeholder="Enter amount"
                                type="number"
                                value={data.amount > 0 ? data.amount : ''}
                                onChange={(e) => setData('amount', parseFloat(e.target.value) || 0)}
                                min="50"
                                className={errors.amount ? 'border-red-500' : ''}
                            />
                            {errors.amount && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
                            )}
                        </div>

                        {/* Action Button */}
                        <Button
                            onClick={handleNextClick}
                            disabled={!data.electricity_distributor_id || !data.meter_number || !data.phone_number || !data.amount || validating}
                            className="w-full gap-2 bg-theme-1 hover:bg-theme-1/90 text-white"
                            size="lg"
                        >
                            {validating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Validating...
                                </>
                            ) : (
                                'Next'
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Please review the details before confirming
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {transactionStatus === 'initial' && (
                            <>
                                <div className="space-y-3">
                                    <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-600 dark:text-gray-400">Distributor:</span>
                                        <span className="font-medium">{electricity_distributions.find(d => d.id.toString() === data.electricity_distributor_id)?.name}</span>
                                    </div>
                                    <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-600 dark:text-gray-400">Meter Type:</span>
                                        <span className="font-medium capitalize">{data.meter_type}</span>
                                    </div>
                                    <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-600 dark:text-gray-400">Meter Number:</span>
                                        <span className="font-medium">{data.meter_number}</span>
                                    </div>
                                    {validatedInfo && (
                                        <>
                                            <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                                                <span className="text-gray-600 dark:text-gray-400">Customer Name:</span>
                                                <span className="font-medium">{validatedInfo.name}</span>
                                            </div>
                                            <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                                                <span className="text-gray-600 dark:text-gray-400">Address:</span>
                                                <span className="font-medium text-right">{validatedInfo.address}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold">
                                        <span>Amount to Pay:</span>
                                        <span className="text-lg text-primary">₦{Number(data.amount).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <KeyRound size={14} />
                                        <span>Enter Transaction PIN</span>
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        {[0, 1, 2, 3].map((i) => (
                                            <input
                                                key={i}
                                                ref={pinRefs[i]}
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={pin[i] || ''}
                                                aria-label={`PIN digit ${i + 1}`}
                                                title={`PIN digit ${i + 1}`}
                                                onChange={(e) => {
                                                    const digit = e.target.value.replace(/\D/g, '').slice(-1);
                                                    const digits = pin.split('');
                                                    digits[i] = digit;
                                                    const newPin = digits.join('').slice(0, 4);
                                                    setPin(newPin);
                                                    setData('transaction_pin', newPin);
                                                    if (digit && i < 3) pinRefs[i + 1].current?.focus();
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Backspace') {
                                                        const digits = pin.split('');
                                                        if (!digits[i] && i > 0) pinRefs[i - 1].current?.focus();
                                                        digits[i] = '';
                                                        const newPin = digits.join('').slice(0, 4);
                                                        setPin(newPin);
                                                        setData('transaction_pin', newPin);
                                                    }
                                                }}
                                                className="h-12 w-12 rounded-md border border-gray-300 bg-white text-center text-lg font-bold text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            />
                                        ))}
                                    </div>
                                    {errors.transaction_pin && (
                                        <p className="text-center text-xs text-red-500">{errors.transaction_pin}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {transactionStatus === 'processing' && (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-center text-gray-600 dark:text-gray-400">Processing...</p>
                            </div>
                        )}

                        {transactionStatus === 'success' && (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                                <p className="text-center font-medium text-green-600 dark:text-green-400">
                                    {transactionMessage}
                                </p>
                            </div>
                        )}

                        {transactionStatus === 'error' && (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                                <p className="text-center font-medium text-red-600 dark:text-red-400">
                                    {transactionMessage}
                                </p>
                            </div>
                        )}
                    </div>

                    {transactionStatus === 'initial' && (
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setConfirmDialogOpen(false)}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={processing || pin.length < 4} className="gap-2">
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm'
                                )}
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
