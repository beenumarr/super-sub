import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, KeyRound, Loader2, Tv, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface CableNetwork {
    id: number;
    name: string;
    user_charges?: {
        amount: number;
        amount_type: 'percentage' | 'fixed';
        type: 'discount' | 'charge';
    };
}

interface CablePlan {
    id: number;
    package_name: string;
    amount: number;
}

interface CableSubscriptionProps {
    cable_networks: CableNetwork[];
}

export default function CableSubscription({ cable_networks }: CableSubscriptionProps) {
    const [cablePlans, setCablePlans] = useState<CablePlan[]>([]);
    const [selectedNetwork, setSelectedNetwork] = useState<string>('');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [validating, setValidating] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
    const [transactionMessage, setTransactionMessage] = useState<string>('');
    const [charges, setCharges] = useState(0);
    const [payableAmount, setPayableAmount] = useState(0);
    const [validatedName, setValidatedName] = useState<string>('');

    const { message } = usePage().props;

    const [pin, setPin] = useState('');
    const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    const { data, setData, post, processing, errors, reset } = useForm({
        cable_name: '',
        smart_card_number: '',
        cable_subscription_plan_id: '',
        amount: 0,
        payable_amount: 0,
        name: '',
        transaction_pin: '',
    });

    const handleNetworkChange = async (networkId: string) => {
        setSelectedNetwork(networkId);
        const network = cable_networks.find(n => n.id.toString() === networkId);
        if (network) {
            setData('cable_name', network.name);

            try {
                const response = await fetch(`/cable_subscriptions/filter_plans?cable_network_id=${networkId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                const plans = await response.json();
                setCablePlans(plans);
            } catch (error) {
                console.error('Failed to load plans:', error);
                toast.error('Failed to load plans');
            }
        }
    };

    const handlePlanChange = (planId: string) => {
        const plan = cablePlans.find(p => p.id.toString() === planId);
        if (plan) {
            setData({
                ...data,
                cable_subscription_plan_id: planId,
                amount: plan.amount,
            });
        }
    };

    const validateSmartCard = async () => {
        if (!data.smart_card_number || !data.cable_name) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setValidating(true);
            const params = new URLSearchParams({
                smart_card_number: data.smart_card_number,
                cable_name: data.cable_name,
            });

            const response = await fetch(`/validate_icu?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.name || 'Invalid smart card number');
            }

            setValidatedName(result.name);
            setData({ ...data, name: result.name });
            applyCharges();
            setConfirmDialogOpen(true);
        } catch (error: any) {
            toast.error(error.message || 'Invalid smart card number');
            console.error('Validation error:', error);
        } finally {
            setValidating(false);
        }
    };

    const applyCharges = () => {
        const network = cable_networks.find(n => n.name === data.cable_name);
        let newAmount = data.amount;
        let chargeAmount = 0;

        if (network?.user_charges) {
            const { amount, amount_type, type } = network.user_charges;
            chargeAmount = amount_type === 'percentage' ? (data.amount * amount) / 100 : amount;

            if (type === 'discount') {
                newAmount = data.amount - chargeAmount;
            } else if (type === 'charge') {
                newAmount = data.amount + chargeAmount;
            }
        }

        setCharges(chargeAmount);
        setPayableAmount(newAmount);
        setData({ ...data, payable_amount: newAmount });
    };

    const handleSubmit = () => {
        if (!data.smart_card_number || !selectedNetwork || !data.cable_subscription_plan_id) {
            toast.error('Please complete all fields');
            return;
        }

        post(route('cable_subscriptions.store'), {
            onSuccess: () => {
                setTransactionStatus('success');
                setTransactionMessage('Cable subscription purchased successfully!');
                reset();
                setPin('');
                setSelectedNetwork('');
                setCablePlans([]);
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

    return (
        <AppLayout>
            <Head title="Buy Cable Subscription" />

            <div className="mx-auto w-full max-w-2xl px-4 py-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tv className="h-6 w-6" />
                            Cable Subscription
                        </CardTitle>
                        <CardDescription>
                            Purchase cable TV subscriptions for DSTV, GOtv, or STARTIMES
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Cable Network Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="network" className="text-base font-medium">
                                Cable Provider *
                            </Label>
                            <Select value={selectedNetwork} onValueChange={handleNetworkChange}>
                                <SelectTrigger id="network">
                                    <SelectValue placeholder="Select cable provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cable_networks.map((network) => (
                                        <SelectItem key={network.id} value={network.id.toString()}>
                                            {network.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Smart Card Number */}
                        <div className="space-y-2">
                            <Label htmlFor="smartcard" className="text-base font-medium">
                                Smart Card Number *
                            </Label>
                            <Input
                                id="smartcard"
                                placeholder="Enter 10-11 digit smart card number"
                                value={data.smart_card_number}
                                onChange={(e) => setData('smart_card_number', e.target.value)}
                                maxLength={11}
                                type="text"
                                className={errors.smart_card_number ? 'border-red-500' : ''}
                            />
                            {errors.smart_card_number && (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {errors.smart_card_number}
                                </p>
                            )}
                        </div>

                        {/* Plan Selection */}
                        {cablePlans.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="plan" className="text-base font-medium">
                                    Select Plan *
                                </Label>
                                <Select
                                    value={data.cable_subscription_plan_id}
                                    onValueChange={handlePlanChange}
                                >
                                    <SelectTrigger id="plan">
                                        <SelectValue placeholder="Choose a subscription plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cablePlans.map((plan) => (
                                            <SelectItem key={plan.id} value={plan.id.toString()}>
                                                {plan.package_name} - ₦{Number(plan.amount).toLocaleString()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Amount Summary */}
                        {data.amount > 0 && (
                            <div className="rounded-lg bg-accent/40 p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Plan Cost:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        ₦{Number(data.amount).toLocaleString()}
                                    </span>
                                </div>
                                {charges > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Service {cable_networks.find(n => n.name === data.cable_name)?.user_charges?.type === 'charge' ? 'Fee' : 'Discount'}:
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            ₦{Number(charges).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">Total to Pay:</span>
                                    <span className="text-lg font-bold text-primary">
                                        ₦{Number(payableAmount || data.amount).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Button */}
                        <Button
                            onClick={validateSmartCard}
                            disabled={!selectedNetwork || !data.smart_card_number || !data.cable_subscription_plan_id || validating}
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
                        <DialogTitle>Confirm Transaction</DialogTitle>
                        <DialogDescription>
                            Please review the details before confirming
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {transactionStatus === 'initial' && (
                            <>
                                <div className="space-y-3">
                                    <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-600 dark:text-gray-400">Provider:</span>
                                        <span className="font-medium">{data.cable_name}</span>
                                    </div>
                                    <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-600 dark:text-gray-400">Smart Card:</span>
                                        <span className="font-medium">{data.smart_card_number}</span>
                                    </div>
                                    <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-600 dark:text-gray-400">Customer Name:</span>
                                        <span className="font-medium">{validatedName}</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold">
                                        <span>Amount to Pay:</span>
                                        <span className="text-lg text-primary">
                                            ₦{Number(payableAmount || data.amount).toLocaleString()}
                                        </span>
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
