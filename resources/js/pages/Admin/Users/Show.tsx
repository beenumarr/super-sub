import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Wallet {
    id: number;
    balance: number;
    currency: string;
}

interface Network {
    id: number;
    name: string;
}

interface DataPlanCategory {
    id: number;
    name: string;
    network_id: number;
    network?: Network;
}

interface DataPlan {
    id: number;
    name: string;
    size: number;
    volume: string;
    telco_price: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    wallet: Wallet;
    email_verified_at: string;
    is_active?: boolean;
    kyc_level?: string;
    user_config?: {
        custom_charge?: boolean;
        categories?: Record<string, number>;
        plans?: Record<string, number>;
    };
}

interface ShowProps {
    user: User;
    categories: DataPlanCategory[];
}

export default function Show({ user, categories }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'Users',
            href: '/admin/users',
        },
        {
            title: user.name,
            href: `/admin/users/${user.id}`,
        },
    ];

    const userForm = useForm({
        password: '',
        email_verified_at: user.email_verified_at ?? null,
        wallet_balance: user.wallet?.balance ?? 0,
        is_active: user.is_active ?? true,
        kyc_level: user.kyc_level ?? 'BASIC',
    });

    const customChargesForm = useForm({
        custom_charge: user.user_config?.custom_charge ?? false,
        categories: user.user_config?.categories ?? {},
        plans: user.user_config?.plans ?? {},
    });

    const [selectedCategoryForPlan, setSelectedCategoryForPlan] = useState<number | null>(null);
    const [availablePlans, setAvailablePlans] = useState<DataPlan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [planChargeAmount, setPlanChargeAmount] = useState<string>('');

    const { data, setData, processing, errors } = userForm;
    const { data: chargesData, setData: setChargesData, processing: chargesProcessing, errors: chargesErrors } = customChargesForm;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        userForm.put(route('admin.users.update', user.id), {
            onSuccess: () => {
                toast.success('User updated successfully');
                router.reload();
            },
            onError: (error) => {
                toast.error(error.message);
            },
        });
    };

    const handleCustomChargesSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        customChargesForm.put(route('admin.users.update-custom-charges', user.id), {
            onSuccess: () => {
                toast.success('Custom charges updated successfully');
                router.reload();
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to update custom charges');
            },
        });
    };

    const handleCategoryChargeChange = (categoryId: number, value: string) => {
        const newCategories = { ...chargesData.categories };
        if (value === '' || parseFloat(value) < 0) {
            delete newCategories[categoryId];
        } else {
            newCategories[categoryId] = parseFloat(value);
        }
        setChargesData('categories', newCategories);
    };

    const handleAddPlan = () => {
        if (!selectedPlanId || !planChargeAmount || parseFloat(planChargeAmount) < 0) {
            toast.error('Please select a plan and enter a valid charge amount');
            return;
        }

        const newPlans = { ...chargesData.plans };
        newPlans[selectedPlanId] = parseFloat(planChargeAmount);
        setChargesData('plans', newPlans);
        setSelectedPlanId(null);
        setPlanChargeAmount('');
        setSelectedCategoryForPlan(null);
        setAvailablePlans([]);
        toast.success('Plan added successfully');
    };

    const handleRemovePlan = (planId: number) => {
        const newPlans = { ...chargesData.plans };
        delete newPlans[planId];
        setChargesData('plans', newPlans);
        toast.success('Plan removed successfully');
    };

    const fetchPlansForCategory = async (categoryId: number) => {
        try {
            const response = await axios.get(route('admin.users.get-plans-by-category', categoryId));
            setAvailablePlans(response.data);
        } catch (error) {
            toast.error('Failed to fetch plans for this category');
            setAvailablePlans([]);
        }
    };

    const handleCategorySelectForPlan = (categoryId: string) => {
        const catId = parseInt(categoryId);
        setSelectedCategoryForPlan(catId);
        fetchPlansForCategory(catId);
        setSelectedPlanId(null);
        setPlanChargeAmount('');
    };

    // Group categories by network
    const categoriesByNetwork = categories.reduce(
        (acc, category) => {
            const networkId = category.network_id;
            if (!acc[networkId]) {
                acc[networkId] = {
                    network: category.network,
                    categories: [],
                };
            }
            acc[networkId].categories.push(category);
            return acc;
        },
        {} as Record<number, { network?: Network; categories: DataPlanCategory[] }>,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />

            <div className="container mx-auto px-4 pt-16 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <p className="text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('admin.users.index')}>
                            <Button variant="outline">Back to Users</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                        <p>{user.email}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                                        <p>{user.phone || 'Not provided'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                            user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : user.role === 'owner'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-green-100 text-green-800'
                                        }`}
                                    >
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Custom Transaction Charges */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Custom Transaction Charges</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCustomChargesSubmit} className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="custom_charge_toggle">Enable Custom Charges</Label>
                                        <Switch
                                            id="custom_charge_toggle"
                                            checked={chargesData.custom_charge}
                                            onCheckedChange={(checked) => setChargesData('custom_charge', checked)}
                                        />
                                    </div>

                                    {chargesData.custom_charge && (
                                        <>
                                            {/* Category Charges */}
                                            <div className="space-y-4">
                                                <Label className="text-base font-semibold">Category Charges</Label>
                                                <p className="text-sm text-gray-500">
                                                    Set custom charges for each plan category. These will be used if no plan-specific charge is set.
                                                </p>
                                                <div className="space-y-3">
                                                    {Object.entries(categoriesByNetwork).map(([networkId, data]) => (
                                                        <div key={networkId} className="rounded-lg border p-4">
                                                            <h4 className="mb-3 font-semibold text-gray-700">
                                                                {data.network?.name || `Network ${networkId}`}
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {data.categories.map((category) => (
                                                                    <div key={category.id} className="flex items-center gap-3">
                                                                        <Label className="w-48 text-sm">{category.name}</Label>
                                                                        <Input
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            placeholder="0.00"
                                                                            value={chargesData.categories[category.id]?.toString() || ''}
                                                                            onChange={(e) => handleCategoryChargeChange(category.id, e.target.value)}
                                                                            className="flex-1"
                                                                        />
                                                                        <span className="text-sm text-gray-500">₦</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Plan Charges */}
                                            <div className="space-y-4">
                                                <Label className="text-base font-semibold">Plan Charges</Label>
                                                <p className="text-sm text-gray-500">
                                                    Add specific charges for individual plans. Plan charges take precedence over category charges.
                                                </p>

                                                {/* Add Plan Form */}
                                                <div className="rounded-lg border p-4">
                                                    <div className="space-y-3">
                                                        <div>
                                                            <Label>Select Category</Label>
                                                            <Select
                                                                value={selectedCategoryForPlan?.toString() || ''}
                                                                onValueChange={handleCategorySelectForPlan}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select a category" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {categories.map((category) => (
                                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                                            {category.network?.name} - {category.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {selectedCategoryForPlan && availablePlans.length > 0 && (
                                                            <>
                                                                <div>
                                                                    <Label>Select Plan</Label>
                                                                    <Select
                                                                        value={selectedPlanId?.toString() || ''}
                                                                        onValueChange={(value) => setSelectedPlanId(parseInt(value))}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select a plan" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {availablePlans.map((plan) => (
                                                                                <SelectItem key={plan.id} value={plan.id.toString()}>
                                                                                    {plan.name} ({plan.size} {plan.volume}) - ₦{plan.telco_price}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                {selectedPlanId && (
                                                                    <div className="flex gap-2">
                                                                        <div className="flex-1">
                                                                            <Label>Charge Amount (₦)</Label>
                                                                            <Input
                                                                                type="number"
                                                                                step="0.01"
                                                                                min="0"
                                                                                placeholder="0.00"
                                                                                value={planChargeAmount}
                                                                                onChange={(e) => setPlanChargeAmount(e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-end">
                                                                            <Button type="button" onClick={handleAddPlan}>
                                                                                Add Plan
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* List of Added Plans */}
                                                {Object.keys(chargesData.plans).length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label>Added Plans</Label>
                                                        <div className="space-y-2">
                                                            {Object.entries(chargesData.plans).map(([planId, amount]) => {
                                                                const plan = availablePlans.find((p) => p.id === parseInt(planId));
                                                                return (
                                                                    <div
                                                                        key={planId}
                                                                        className="flex items-center justify-between rounded-lg border p-3"
                                                                    >
                                                                        <div>
                                                                            <span className="font-medium">
                                                                                Plan ID: {planId}
                                                                                {plan && ` - ${plan.name} (${plan.size} ${plan.volume})`}
                                                                            </span>
                                                                            <span className="ml-2 text-gray-500">₦{amount.toFixed(2)}</span>
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            onClick={() => handleRemovePlan(parseInt(planId))}
                                                                        >
                                                                            Remove
                                                                        </Button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <Button type="submit" disabled={chargesProcessing}>
                                        {chargesProcessing ? 'Saving...' : 'Save Custom Charges'}
                                    </Button>
                                    {chargesErrors.custom_charge && <p className="text-sm text-red-500">{chargesErrors.custom_charge}</p>}
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Wallet */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Wallet</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
                                        <p className="text-2xl font-bold">
                                            {'₦'}
                                            {user.wallet?.balance?.toLocaleString() || '0.00'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Admin Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Admin Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="text"
                                            placeholder="Leave blank to keep unchanged"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="email_verified_at_toggle">Email Verified</Label>
                                        <Switch
                                            id="email_verified_at_toggle"
                                            checked={!!data.email_verified_at}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    const now = new Date();
                                                    const formatted = now.toISOString().slice(0, 19);
                                                    setData('email_verified_at', formatted);
                                                } else {
                                                    setData('email_verified_at', '');
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="is_active_toggle">Active</Label>
                                        <Switch
                                            id="is_active_toggle"
                                            checked={!!data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>

                                    {data.email_verified_at && (
                                        <p className="mt-1 text-xs text-gray-500">Verified At: {new Date(data.email_verified_at).toLocaleString()}</p>
                                    )}

                                    {errors.email_verified_at && <p className="text-sm text-red-500">{errors.email_verified_at}</p>}

                                    <div>
                                        <Label htmlFor="kyc_level">KYC Level</Label>
                                        <Select value={data.kyc_level} onValueChange={(value) => setData('kyc_level', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select KYC level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="BASIC">Basic</SelectItem>
                                                <SelectItem value="LEVEL1">Level 1</SelectItem>
                                                <SelectItem value="LEVEL2">Level 2</SelectItem>
                                                <SelectItem value="LEVEL3">Level 3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.kyc_level && <p className="text-sm text-red-500">{errors.kyc_level}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="wallet_balance">Wallet Balance (₦)</Label>
                                        <Input
                                            id="wallet_balance"
                                            type="number"
                                            step="0.01"
                                            value={data.wallet_balance}
                                            onChange={(e) => setData('wallet_balance', parseFloat(e.target.value))}
                                        />
                                        {errors.wallet_balance && <p className="text-sm text-red-500">{errors.wallet_balance}</p>}
                                    </div>

                                    <Button type="submit" disabled={processing}>
                                        Save Changes
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
