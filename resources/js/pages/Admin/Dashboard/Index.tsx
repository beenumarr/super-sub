import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatDate, formatToThousands } from '@/utils';
import { Head, Link, router } from '@inertiajs/react';
import { DollarSign, Users, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AdminDashboardProps {
    stats: {
        users: {
            total: number;
            new: number;
            admin: number;
        };
        transactions: {
            success: number;
            failed: number;
            success_amount: number;
            failed_amount: number;
            data_transactions: number;
        };
        wallets: {
            total_balance: number;
            average_balance: number;
        };
        date_filter: {
            current: string;
            start_date: string;
            end_date: string;
        };
        network_stats: {
            network: string;
            total_transactions: number;
            successful_transactions: number;
            failed_transactions: number;
            pending_transactions: number;
            success_rate: number;
            successful_amount: number;
            failed_amount: number;
            pending_amount: number;
        }[];
    };
    recent_transactions: {
        id: number;
        reference_id: string;
        user: string;
        description: string;
        date: string;
        status: string;
        amount: number;
        network: string;
        api_response: string;
    }[];
    top_users: {
        id: number;
        name: string;
        email: string;
        total_spent: number;
        successful_transactions: number;
        failed_transactions: number;
        failed_amount: number;
        pending_amount: number;
    }[];
    user_role: string;
}

export default function AdminDashboard({ stats, recent_transactions, top_users, user_role }: AdminDashboardProps) {
    const [dateFilter, setDateFilter] = useState(stats.date_filter.current);
    const [customDate, setCustomDate] = useState('');
    const isInitialMount = useRef(true);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
    ];

    // Update the date filter when changed (skip on initial mount to avoid extra request)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (dateFilter !== 'custom') {
            router.get('/admin/dashboard', { date_filter: dateFilter }, { preserveState: true });
        }
    }, [dateFilter]);

    // Handle custom date change
    const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomDate(value);
        if (value) {
            router.get('/admin/dashboard', { date_filter: 'custom', custom_date: value }, { preserveState: true });
        }
    };

    const overviewCards = [
        {
            title: 'Total Users',
            value: stats.users.total,
            description: `${stats.users.new} new today`,
            icon: <Users className="text-theme-1 h-5 w-5" />,
        },
        ...(user_role === 'admin'
            ? [
                  {
                      title: 'Wallet Balance',
                      value: `₦${formatToThousands(stats.wallets.total_balance)}`,
                      description: `Avg: ₦${formatToThousands(stats.wallets.average_balance)}`,
                      icon: <Wallet className="text-theme-1 h-5 w-5" />,
                  },
              ]
            : []),
        {
            title: 'Transactions',
            value: stats.transactions.success + stats.transactions.failed,
            description: `${stats.transactions.success} successful`,
            icon: <DollarSign className="text-theme-1 h-5 w-5" />,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            {stats.date_filter.start_date} to {stats.date_filter.end_date}
                        </p>
                    </div>
                    <div className="mt-4 flex space-x-2 sm:mt-0">
                        <div className="flex items-center space-x-2">
                            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="yesterday">Yesterday</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="custom">Custom Date</SelectItem>
                                </SelectContent>
                            </Select>

                            {dateFilter === 'custom' && (
                                <input
                                    type="date"
                                    value={customDate}
                                    onChange={handleCustomDateChange}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                    aria-label="Custom date selection"
                                    placeholder="Select date"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {overviewCards.map((card, index) => (
                        <Card key={index} className="overflow-hidden rounded-none py-2 shadow-none">
                            <CardContent className="p-0 px-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                        <h3 className="mt-1 text-3xl font-bold">{card.value}</h3>
                                        <p className="mt-1 text-xs text-gray-500">{card.description}</p>
                                    </div>
                                    <div className="bg-theme-1/10 rounded-full p-3">{card.icon}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Transactions & Top Users */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Recent Transactions */}
                    <Card className="rounded-none py-2 shadow-none">
                        <CardHeader className="px-2 pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
                                <Link href="/admin/transactions">
                                    <Button variant="ghost" size="sm" className="text-theme-1">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 px-2">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Network</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recent_transactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{transaction.user}</TableCell>
                                            <TableCell>
                                                <div className="max-w-[150px] truncate">{transaction.description}</div>
                                                <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                                            </TableCell>
                                            <TableCell>{transaction.network}</TableCell>
                                            <TableCell>₦{formatToThousands(transaction.amount)}</TableCell>
                                            <TableCell className="text-right">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                        transaction.status === 'SUCCESS'
                                                            ? 'bg-green-100 text-green-800'
                                                            : transaction.status === 'FAILED'
                                                              ? 'bg-red-100 text-red-800'
                                                              : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                    title={transaction.api_response}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {transaction.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Top Users */}
                    <Card className="rounded-none py-2 shadow-none">
                        <CardHeader className="px-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">Top Users</CardTitle>
                                <Link href="/admin/top-users">
                                    <Button variant="ghost" size="sm" className="text-theme-1">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 px-2">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="text-center">Successful</TableHead>
                                        <TableHead className="text-center">Failed</TableHead>
                                        {user_role === 'admin' && <TableHead className="text-right">Total Spent</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {top_users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                    {user.successful_transactions}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                                    {user.failed_transactions}
                                                </span>
                                            </TableCell>
                                            {user_role === 'admin' && (
                                                <TableCell className="text-right">₦{formatToThousands(user.total_spent)}</TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
