import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface DataPlanCategory {
    id: number;
    name: string;
    network_id: number;
}

interface DataPlan {
    id: number;
    name: string;
    price: number;
    size: number;
    volume: string;
    validity: number | null;
    description: string | null;
    category: DataPlanCategory;
    data_plan_category_id: number;
}

interface DataTransactionsProps {
    phoneNumbers: PhoneNumber[];
    dataPlans: DataPlan[];
    networks: Network[];
    categories: DataPlanCategory[];
    message: string;
}

export default function DataTransactions({ dataPlans, networks, categories }: DataTransactionsProps) {
    const [filteredDataPlans, setFilteredDataPlans] = useState<DataPlan[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<DataPlanCategory[]>([]);
    const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
    const [beneficiaryError, setBeneficiaryError] = useState<string | null>(null);
    const [transactionStatus, setTransactionStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
    const [transactionMessage, setTransactionMessage] = useState<string>('');

    const { message } = usePage().props;

    const form = useForm({
        phone_number_id: '',
        beneficiary: '',
        data_plan_id: '',
        network_id: '',
    });

    const handleNetworkChange = (networkId: string) => {
        setSelectedNetwork(networkId);
        form.setData('network_id', networkId);

        // Filter categories by network
        const networkIdNum = parseInt(networkId);
        const networkCategories = categories.filter((cat) => cat.network_id === networkIdNum);
        setFilteredCategories(networkCategories);

        if (networkCategories.length > 0) {
            handleCategoryChange(networkCategories[0].id.toString());
        } else {
            setSelectedCategory(null);
            setFilteredDataPlans([]);
        }
    };

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);

        // Filter data plans by category
        const filtered = dataPlans.filter((plan) => plan.data_plan_category_id.toString() === categoryId);
        setFilteredDataPlans(filtered);
    };

    const handleBeneficiaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        form.setData('beneficiary', e.target.value);
        setBeneficiaryError(null);
    };

    const handlePlanChange = (planId: string) => {
        console.log(planId);
        form.setData('data_plan_id', planId.toString());
        setSelectedPlan(dataPlans.find((plan) => plan.id.toString() === planId) || null);

        // Validate beneficiary before opening the dialog
        if (!validateBeneficiary()) {
            return;
        }

        // Open the confirmation dialog immediately when a plan is selected
        setConfirmDialogOpen(true);
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

        if (!form.data.data_plan_id) {
            toast.error('Please select a data plan');
            return;
        }

        setConfirmDialogOpen(true);
    };

    const confirmPurchase = () => {
        setTransactionStatus('processing');

        form.post(route('data-transactions.purchase'), {
            onSuccess: () => {
                setTransactionStatus('success');
                setTransactionMessage((message as string) ?? 'Data plan purchased successfully!');
                setTimeout(() => {
                    setConfirmDialogOpen(false);
                    setTransactionStatus('initial');
                }, 6000);
            },
            onError: (errors) => {
                setTransactionStatus('error');
                const errorMessage = errors.error || Object.values(errors)[0] || 'Failed to purchase data plan';
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
                selectedPlan && (
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
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Data Plan</span>
                                <span>{selectedPlan.name}</span>
                            </div>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Size</span>
                                <span>
                                    {selectedPlan.size} {selectedPlan.volume}
                                </span>
                            </div>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Validity</span>
                                <span>{selectedPlan.validity ? `${selectedPlan.validity} days` : 'No expiry'}</span>
                            </div>
                            <div className="flex items-center justify-between font-medium">
                                <span>Amount</span>
                                <span className="text-lg">₦{selectedPlan.price}</span>
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
                )
            );
        }
    };

    return (
        <AppLayout>
            <Head title="Buy Data" />

            <div className="px-4 py-12 lg:px-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
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
                            <Card className="hadow bg-accent/40 mx-auto max-w-2xl">
                                <CardContent className="space-y-8 p-4">
                                    {/* Phone Numbers Section */}
                                    <div>
                                        <h3 className="mb-4 w-full text-center text-lg font-medium">Buy Data Bundle</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone_number_id">Select Network</Label>

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

                                            {/* Beneficiary phone number */}
                                            <div className="space-y-2">
                                                <Label htmlFor="beneficiary"> Phone Number</Label>
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
                                        </div>
                                    </div>

                                    {/* Data Plan Selection */}
                                    {selectedNetwork && filteredCategories.length > 0 && (
                                        <div className="">
                                            <h3 className="mb-4 text-sm font-medium">Data Plan</h3>
                                            <Tabs value={selectedCategory || ''} onValueChange={handleCategoryChange} className="w-full">
                                                <TabsList className="mb-4 w-full justify-start overflow-auto">
                                                    {filteredCategories.map((category) => (
                                                        <TabsTrigger key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>

                                                <TabsContent value={selectedCategory || ''} className="mt-0">
                                                    <RadioGroup value={form.data.data_plan_id} onValueChange={handlePlanChange} className="contents">
                                                        <div className="scrollbar-hide grid max-h-[800px] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                                                            {filteredDataPlans.map((plan) => (
                                                                <Label
                                                                    htmlFor={`plan-${plan.id}`}
                                                                    key={plan.id}
                                                                    className={`hover:border-theme-1/10 flex cursor-pointer flex-col rounded-lg border p-2 shadow-sm transition-colors hover:shadow-md ${
                                                                        form.data.data_plan_id === plan.id.toString()
                                                                            ? 'border-theme-1/10 dark:border-theme-1/30 bg-theme-1/10 dark:bg-theme-1/20'
                                                                            : 'border-gray-200 dark:border-gray-700'
                                                                    }`}
                                                                >
                                                                    <div className="mb-1 flex items-center justify-center">
                                                                        <RadioGroupItem
                                                                            value={plan.id.toString()}
                                                                            id={`plan-${plan.id}`}
                                                                            className="mr-2 hidden"
                                                                        />
                                                                        <span className="cursor-pointer text-sm font-medium">{plan.name}</span>
                                                                    </div>

                                                                    <div className="flex flex-1 flex-col justify-center">
                                                                        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                                                                            {plan.validity
                                                                                ? `${plan.validity} Day${plan.validity > 1 ? 's' : ''}`
                                                                                : 'No expiry'}
                                                                        </div>

                                                                        <div className="text-theme-1 mt-1 text-center text-base font-bold">
                                                                            ₦ {plan.price}
                                                                        </div>
                                                                    </div>
                                                                </Label>
                                                            ))}
                                                        </div>
                                                    </RadioGroup>

                                                    {filteredDataPlans.length === 0 && (
                                                        <div className="py-8 text-center">
                                                            <p className="text-gray-500 dark:text-gray-400">
                                                                No data plans available for this category.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {form.errors.data_plan_id && (
                                                        <p className="mt-2 text-sm text-red-500">{form.errors.data_plan_id}</p>
                                                    )}
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    )}
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
                            <DialogTitle>Confirm Data Purchase</DialogTitle>
                            <DialogDescription>Please review your data bundle purchase details below.</DialogDescription>
                        </DialogHeader>
                    )}

                    {renderDialogContent()}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
