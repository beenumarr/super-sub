import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface Wallet {
    id: number;
    balance: number;
    currency: string;
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
}

interface ShowProps {
    user: User;
}

export default function Show({ user }: ShowProps) {
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

    const { data, setData, processing, errors } = userForm;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        userForm.put(route('admin.users.update', user.id), {
            onSuccess: () => {
                toast.success('Balance has been retrieved');
                router.reload();
            },
            onError: (error) => {
                toast.error(error.message);
            },
        });
    };

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

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
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
                    </div>

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
                                                const formatted = now.toISOString().slice(0, 19); // format: YYYY-MM-DDTHH:mm:ss
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
        </AppLayout>
    );
}
