import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, CreditCard, Loader2, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Network {
    id: number;
    name: string;
    status: string;
}

interface PhoneNumber {
    id: number;
    number: string;
    network: Network;
    status: string;
    airtime_balance: string;
    data_balance: string;
}

interface AirtimeTransactionsProps {
    phoneNumbers: PhoneNumber[];
    networks: Network[];
    message: string;
}

const AMOUNTS = [50, 100, 200, 500, 1000, 2000, 5000, 10000];

export default function AirtimeTransactions({ networks }: AirtimeTransactionsProps) {
    const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [beneficiaryError, setBeneficiaryError] = useState<string | null>(null);
    const [transactionStatus, setTransactionStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
    const [transactionMessage, setTransactionMessage] = useState<string>('');
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    const { message } = usePage().props;

    const form = useForm({
        phone_number_id: '',
        beneficiary: '',
        amount: '',
        network_id: '',
    });

    const handleNetworkChange = (networkId: string) => {
        setSelectedNetwork(networkId);
        form.setData('network_id', networkId);
    };

    const handleBeneficiaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setData('beneficiary', e.target.value);
        setBeneficiaryError(null);
    };

    const handleAmountChange = (amount: number) => {
        setSelectedAmount(amount);
        form.setData('amount', amount.toString());
    };

    const validateBeneficiary = (): boolean => {
        const phoneRegex = /^(0|\+234|234)?[789][01]\d{8}$/;
        if (!form.data.beneficiary) {
            setBeneficiaryError('Beneficiary phone number is required');
            return false;
        }
        if (!phoneRegex.test(form.data.beneficiary)) {
            setBeneficiaryError('Please enter a valid Nigerian phone number');
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateBeneficiary()) {
            return;
        }
        if (!form.data.amount) {
            toast.error('Please select an amount');
            return;
        }
        setConfirmDialogOpen(true);
    };

    const confirmPurchase = () => {
        setTransactionStatus('processing');
        form.post(route('airtime-transactions.purchase'), {
            onSuccess: () => {
                setTransactionStatus('success');
                setTransactionMessage((message as string) ?? 'Airtime purchased successfully!');
                setTimeout(() => {
                    setConfirmDialogOpen(false);
                    setTransactionStatus('initial');
                }, 6000);
            },
            onError: (errors) => {
                setTransactionStatus('error');
                const errorMessage = errors.error || Object.values(errors)[0] || 'Failed to purchase airtime';
                setTransactionMessage(errorMessage as string);
            },
        });
    };

    // Confirmation Dialog
    const renderDialogContent = () => {
        if (transactionStatus === 'processing') {
            return (
                <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="text-theme-1 h-16 w-16 animate-spin" />
                    <p className="mt-4 text-center text-lg font-medium">Processing your transaction...</p>
                    <p className="text-center text-gray-500">Please wait while we process your request.</p>
                </div>
            );
        } else if (transactionStatus === 'success') {
            return (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-[var(--animate-bounce-once)]">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <p className="mt-4 text-center text-lg font-medium text-green-600">Transaction Successful!</p>
                    <p className="text-center text-gray-600">{transactionMessage}</p>
                </div>
            );
        } else if (transactionStatus === 'error') {
            return (
                <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                    <p className="mt-4 text-center text-lg font-medium text-red-600">Transaction Failed</p>
                    <p className="text-center text-gray-600">{transactionMessage}</p>
                    <div className="mt-6">
                        <Button variant="outline" onClick={() => setTransactionStatus('initial')}>
                            Try Again
                        </Button>
                    </div>
                </div>
            );
        } else {
            // Initial state - show confirmation details
            return (
                <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Beneficiary</span>
                            <span className="font-medium">{form.data.beneficiary}</span>
                        </div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Network</span>
                            <span>{networks.find((network) => network.id === parseInt(selectedNetwork || ''))?.name}</span>
                        </div>
                        <div className="flex items-center justify-between font-medium">
                            <span>Amount</span>
                            <span className="text-lg">₦{selectedAmount}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={form.processing}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmPurchase}
                            className="bg-theme-1 hover:bg-theme-1/90 text-white"
                            disabled={form.processing}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Confirm Purchase
                        </Button>
                    </DialogFooter>
                </div>
            );
        }
    };

    return (
        <AppLayout>
            <Head title="Buy Airtime" />
            <div className="px-4 py-12 lg:px-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Buy Airtime</h2>
                    </div>
                    {networks.length === 0 ? (
                        <Card className="bg-white shadow dark:bg-gray-800">
                            <CardContent className="p-6">
                                <div className="py-8 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <Phone className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                                    </div>
                                    <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">No Networks</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Service is currently unavailable. Please check back again later.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <Card className="bg-accent/40 mx-auto max-w-2xl shadow">
                                <CardContent className="space-y-8 p-6">
                                    {/* Network Selection */}
                                    <div>
                                        <h3 className="mb-4 text-lg font-medium">Send Airtime</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone_number_id">Network Provider</Label>
                                                <RadioGroup value={selectedNetwork || ''} onValueChange={handleNetworkChange} className="contents">
                                                    <div className="grid grid-cols-4 gap-3">
                                                        {networks.map((network) => (
                                                            <Label
                                                                htmlFor={`network-${network.id}`}
                                                                key={network.id}
                                                                className={`group relative flex w-full items-center rounded-lg border-2 p-3 shadow-sm transition-all duration-300 ${
                                                                    network.status === 'INACTIVE'
                                                                        ? 'cursor-not-allowed border-gray-300 bg-gray-100 opacity-50 dark:border-gray-600 dark:bg-gray-700'
                                                                        : `cursor-pointer hover:scale-105 hover:shadow-md ${
                                                                              selectedNetwork === network.id.toString()
                                                                                  ? 'border-theme-1 from-theme-1/20 to-theme-1/10 shadow-theme-1/25 bg-gradient-to-br'
                                                                                  : 'hover:border-theme-1/30 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                                                          }`
                                                                }`}
                                                            >
                                                                <RadioGroupItem
                                                                    value={network.id.toString()}
                                                                    id={`network-${network.id}`}
                                                                    className="absolute top-1 right-1 hidden"
                                                                />
                                                                <img
                                                                    src={`/images/icons/${network.name.toLowerCase()}.png`}
                                                                    alt={`${network.name} logo`}
                                                                    className="h-8 w-8 rounded object-contain"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                                <span className="ml-3 hidden font-medium text-gray-900 sm:inline dark:text-white">
                                                                    {network.name}
                                                                </span>
                                                                {selectedNetwork === network.id.toString() && (
                                                                    <div className="from-theme-1/10 absolute inset-0 rounded-lg bg-gradient-to-br to-transparent"></div>
                                                                )}
                                                            </Label>
                                                        ))}
                                                    </div>
                                                </RadioGroup>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone_number_id">Dispense Channel</Label>
                                                <RadioGroup value={'Momo'} onValueChange={undefined} className="contents">
                                                    <div className="grid grid-cols-4 gap-3">
                                                        <Label
                                                            htmlFor={`momo`}
                                                            className={`group border-theme-1 from-theme-1/20 to-theme-1/10 shadow-theme-1/25 relative flex w-full cursor-pointer items-center rounded-lg border-2 bg-gradient-to-br p-3 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md`}
                                                        >
                                                            <RadioGroupItem value="Momo" id={`Momo`} className="absolute top-1 right-1 hidden" />
                                                            <img
                                                                src={`/images/icons/momo-log.svg`}
                                                                alt={`logo`}
                                                                className="h-8 w-8 rounded object-contain"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                            <span className="ml-3 hidden font-medium text-gray-900 sm:inline dark:text-white">
                                                                Momo
                                                            </span>
                                                            <div className="from-theme-1/10 absolute inset-0 rounded-lg bg-gradient-to-br to-transparent"></div>
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                            {/* Beneficiary phone number */}
                                            <div className="space-y-2">
                                                <Label htmlFor="beneficiary">Beneficiary Phone Number</Label>
                                                <Input
                                                    id="beneficiary"
                                                    value={form.data.beneficiary}
                                                    onChange={handleBeneficiaryChange}
                                                    placeholder="e.g. 08012345678"
                                                    className={beneficiaryError ? 'border-red-500' : ''}
                                                />
                                                {beneficiaryError && <p className="text-sm text-red-500">{beneficiaryError}</p>}
                                                {form.errors.beneficiary && <p className="text-sm text-red-500">{form.errors.beneficiary}</p>}
                                            </div>
                                            {/* Amount selection */}
                                            <div className="space-y-2">
                                                <Label htmlFor="amount">Amount</Label>
                                                <RadioGroup
                                                    value={selectedAmount?.toString() || ''}
                                                    onValueChange={(val) => handleAmountChange(Number(val))}
                                                    className="flex flex-wrap gap-2"
                                                >
                                                    {AMOUNTS.map((amt) => (
                                                        <Label
                                                            key={amt}
                                                            className={`flex cursor-pointer items-center rounded border px-3 py-2 ${selectedAmount === amt ? 'border-theme-1 bg-theme-1/10' : 'border-gray-200'}`}
                                                        >
                                                            <RadioGroupItem value={amt.toString()} id={`amount-${amt}`} className="mr-2" />₦{amt}
                                                        </Label>
                                                    ))}
                                                </RadioGroup>
                                                {form.errors.amount && <p className="text-sm text-red-500">{form.errors.amount}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end border-t pt-2">
                                        <Button type="submit" className="bg-theme-1 hover:bg-theme-1/90 text-white" disabled={form.processing}>
                                            Continue to Purchase
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    )}
                </div>
            </div>
            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onOpenChange={(open) => {
                    // Always call the state setter to maintain consistency
                    // But only allow closing if not in processing state
                    if (!open && transactionStatus !== 'processing') {
                        setConfirmDialogOpen(false);
                        setTransactionStatus('initial');
                    } else if (!open && transactionStatus === 'processing') {
                        // Don't close the modal, but still update the state to prevent overlay issues
                        setConfirmDialogOpen(true);
                        return;
                    } else {
                        setConfirmDialogOpen(open);
                    }
                }}
            >
                <DialogContent>
                    {transactionStatus === 'initial' && (
                        <DialogHeader>
                            <DialogTitle>Confirm Airtime Purchase</DialogTitle>
                            <DialogDescription>Please review your airtime purchase details below.</DialogDescription>
                        </DialogHeader>
                    )}
                    {renderDialogContent()}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
