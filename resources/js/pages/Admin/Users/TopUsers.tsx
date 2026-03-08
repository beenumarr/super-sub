import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatToThousands } from '@/utils';
import { Head, Link, router } from '@inertiajs/react';
import { Award, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TopUser {
    id: number;
    rank: number;
    name: string;
    email: string;
    total_spent: number;
    successful_transactions: number;
    failed_transactions: number;
    total_transactions: number;
    success_rate: number;
    last_transaction_at: string | null;
}

interface TopUsersProps {
    users: {
        data: TopUser[];
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    date_filter: {
        current: string;
        start_date: string;
        end_date: string;
    };
    user_role: string;
}

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
        title: 'Top Users',
        href: '/admin/top-users',
    },
];

export default function TopUsers({ users, date_filter, user_role }: TopUsersProps) {
    const [dateFilter, setDateFilter] = useState(date_filter.current);
    const [customDate, setCustomDate] = useState('');

    // Format last transaction time
    const formatLastTransaction = (dateString: string | null) => {
        if (!dateString) return 'Never';

        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        let timeAgo = '';
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
            timeAgo = diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            timeAgo = `${diffInHours}h ago`;
        } else {
            timeAgo = `${diffInDays}d ago`;
        }

        const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });

        return `${timeAgo} | ${formattedDate}`;
    };

    // Update the date filter when changed
    useEffect(() => {
        if (dateFilter !== 'custom') {
            router.get('/admin/top-users', { date_filter: dateFilter }, { preserveState: true });
        }
    }, [dateFilter]);

    // Handle custom date change
    const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomDate(value);
        if (value) {
            router.get('/admin/top-users', { date_filter: 'custom', custom_date: value }, { preserveState: true });
        }
    };

    // Handle pagination
    const handlePageChange = (url: string) => {
        const urlObj = new URL(url);
        const page = urlObj.searchParams.get('page');
        router.get(
            '/admin/top-users',
            {
                page,
                date_filter: dateFilter,
                ...(dateFilter === 'custom' && customDate ? { custom_date: customDate } : {}),
            },
            { preserveState: true },
        );
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
        if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
        if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-yellow-50 border-yellow-200';
        if (rank === 2) return 'bg-gray-50 border-gray-200';
        if (rank === 3) return 'bg-orange-50 border-orange-200';
        return 'bg-white border-gray-200';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Top Users" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Top Users</h1>
                        <p className="text-gray-500">
                            Users ranked by transaction performance from {date_filter.start_date} to {date_filter.end_date}
                        </p>
                    </div>
                    <div className="mt-4 flex space-x-2 sm:mt-0">
                        <Link href="/admin/dashboard">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
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

                {/* Stats Overview */}
                <div className={`mb-6 grid grid-cols-1 gap-4 ${user_role === 'admin' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                                    <p className="text-2xl font-bold">{users.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center">
                                <Trophy className="h-8 w-8 text-yellow-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-500">Top Performer</p>
                                    <p className="text-lg font-bold">{users.data[0]?.name || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {user_role === 'admin' && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center">
                                    <Award className="h-8 w-8 text-green-600" />
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-500">Highest Spend</p>
                                        <p className="text-lg font-bold">₦{formatToThousands(users.data[0]?.total_spent || 0)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Users Table */}
                {users.data.length === 0 ? (
                    <div className="py-10 text-center">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No users found</h3>
                        <p className="mt-1 text-sm text-gray-500">No users have transactions for the selected period.</p>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-full">
                                    <thead className="bg-accent/50">
                                        <tr className="border-b">
                                            <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                Rank
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                User
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                Email
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                Total Transactions
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                Success Rate
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                Successful
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                Failed
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                Last Transaction
                                            </th>
                                            {user_role === 'admin' && (
                                                <th className="px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                    Total Spent
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {users.data.map((user) => (
                                            <tr key={user.id} className={`hover:bg-gray-50 ${getRankStyle(user.rank)}`}>
                                                <td className="px-3 py-4 text-sm whitespace-nowrap sm:px-6">
                                                    <div className="flex items-center">{getRankIcon(user.rank)}</div>
                                                </td>
                                                <td className="px-3 py-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:px-6">
                                                    <Link href={`/admin/users/${user.id}`} className="hover:text-blue-600 hover:underline">
                                                        {user.name}
                                                    </Link>
                                                </td>
                                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 sm:px-6">{user.email}</td>
                                                <td className="px-3 py-4 text-center text-sm whitespace-nowrap sm:px-6">
                                                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                        {user.total_transactions}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4 text-center text-sm whitespace-nowrap sm:px-6">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                            user.success_rate >= 80
                                                                ? 'bg-green-100 text-green-800'
                                                                : user.success_rate >= 60
                                                                  ? 'bg-yellow-100 text-yellow-800'
                                                                  : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {user.success_rate}%
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4 text-center text-sm whitespace-nowrap sm:px-6">
                                                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                        {user.successful_transactions}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4 text-center text-sm whitespace-nowrap sm:px-6">
                                                    <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                                        {user.failed_transactions}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4 text-center text-sm whitespace-nowrap sm:px-6">
                                                    <span className="text-xs text-gray-600">{formatLastTransaction(user.last_transaction_at)}</span>
                                                </td>
                                                {user_role === 'admin' && (
                                                    <td className="px-3 py-4 text-right text-sm font-medium whitespace-nowrap text-gray-900 sm:px-6">
                                                        ₦{formatToThousands(user.total_spent)}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex flex-1 justify-between sm:hidden">
                            {users.links[0].url && (
                                <Button variant="outline" onClick={() => handlePageChange(users.links[0].url!)} disabled={!users.links[0].url}>
                                    Previous
                                </Button>
                            )}
                            {users.links[users.links.length - 1].url && (
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(users.links[users.links.length - 1].url!)}
                                    disabled={!users.links[users.links.length - 1].url}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{users.from}</span> to <span className="font-medium">{users.to}</span> of{' '}
                                    <span className="font-medium">{users.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    {users.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && handlePageChange(link.url)}
                                            disabled={!link.url}
                                            aria-label={`Go to page ${link.label}`}
                                            className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                                                link.active
                                                    ? 'z-10 border-blue-500 bg-blue-50 text-blue-600'
                                                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                            } ${!link.url ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${
                                                index === 0 ? 'rounded-l-md' : ''
                                            } ${index === users.links.length - 1 ? 'rounded-r-md' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
