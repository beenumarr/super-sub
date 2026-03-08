import CreateUserModal from '@/components/modals/CreateUserModal';
import EditUserModal, { type EditUserModalUser } from '@/components/modals/EditUserModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatToThousands } from '@/utils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowDownUp, Edit, Eye, LogIn, MoreHorizontal, RefreshCw, Trash2, UserCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    wallet: {
        balance: number;
    };
    category?: { id: number; name: string } | null;
    phone_numbers_count: number;
    connected_phone_numbers_count: number;
    disconnected_phone_numbers_count: number;
    transactions_count: number;
    phone_number: string | null;
    email_verified_at: string;
    created_at: string;
    kyc_level?: string;
    current_session: {
        id: string;
        ip_address: string | null;
        user_agent: string | null;
        last_activity: string | null;
        is_current: boolean;
    } | null;
}

type DateFilter = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month';

interface IndexProps {
    users: User[];
    activeRole?: string;
    filters?: {
        search?: string;
        sort_by?: 'balance' | 'created_at' | 'name';
        sort_dir?: 'asc' | 'desc';
        date?: DateFilter;
        category_id?: string | number | null;
    };
    categories?: { id: number; name: string }[];
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
];

export default function Index({ users, activeRole, filters, categories = [] }: IndexProps) {
    const [loadingBalance, setLoadingBalance] = useState<number | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [assigning, setAssigning] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>(activeRole ?? 'all');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<EditUserModalUser | null>(null);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);

    // Dropdown state management
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    // Filters UI state
    const [search, setSearch] = useState(filters?.search ?? '');
    const [sortBy, setSortBy] = useState(filters?.sort_by ?? 'balance');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>(filters?.sort_dir ?? 'desc');
    const [date, setDate] = useState<DateFilter | undefined>(filters?.date as DateFilter | undefined);
    const [categoryId, setCategoryId] = useState<string | undefined>(
        filters?.category_id !== undefined && filters?.category_id !== null ? String(filters?.category_id) : undefined,
    );

    const params = useMemo(() => {
        const q: Record<string, string> = {};
        if (search) q.search = search;
        if (sortBy) q.sort_by = sortBy;
        if (sortDir) q.sort_dir = sortDir;
        if (date) q.date = date;
        if (categoryId !== undefined && categoryId !== '') q.category_id = categoryId;
        return q;
    }, [search, sortBy, sortDir, date, categoryId]);

    type ParamKeys = 'sort_by' | 'sort_dir' | 'category_id' | 'date' | 'search';
    const buildParamsNow = (overrides?: Partial<Record<ParamKeys, string>>) => {
        const q: Record<string, string> = {};
        const current: Record<string, string | undefined> = {
            search,
            sort_by: sortBy,
            sort_dir: sortDir,
            date,
            category_id: categoryId,
        } as Record<ParamKeys, string | undefined>;
        const merged = { ...current, ...(overrides || {}) };
        if (merged.search) q.search = merged.search;
        if (merged.sort_by) q.sort_by = merged.sort_by as string;
        if (merged.sort_dir) q.sort_dir = merged.sort_dir as string;
        if (merged.date) q.date = merged.date as string;
        if (merged.category_id) q.category_id = merged.category_id as string;
        return q;
    };

    const onSort = (column: 'balance' | 'created_at' | 'name') => {
        const nextDir = sortBy === column ? (sortDir === 'asc' ? 'desc' : 'asc') : 'desc';
        setSortBy(column);
        setSortDir(nextDir);
        router.get(
            activeRole ? route('admin.users.by-role', activeRole) : route('admin.users.index'),
            buildParamsNow({ sort_by: column, sort_dir: nextDir }),
            { preserveState: true, replace: true },
        );
    };

    const getUsersRoute = (role: string) => (role && role !== 'all' ? route('admin.users.by-role', role) : route('admin.users.index'));

    // Debounce search
    useEffect(() => {
        const handle = setTimeout(() => {
            router.get(getUsersRoute(selectedRole), params, {
                preserveState: true,
                replace: true,
            });
        }, 400);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const applyFilters = () => {
        router.get(getUsersRoute(selectedRole), params, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSortBy('balance');
        setSortDir('desc');
        setDate(undefined);
        router.get(getUsersRoute(selectedRole), {}, { preserveState: true, replace: true });
    };

    const getBalanceForm = useForm({
        userId: 0,
    });

    const editForm = useForm({
        password: '',
        email_verified_at: null as string | null,
        wallet_balance: 0,
        is_active: true as boolean,
        kyc_level: 'BASIC' as string,
    });

    const sendLBA = async (id: number) => {
        setLoadingBalance(id);

        getBalanceForm.setData({
            userId: id,
        });

        getBalanceForm.post(route('admin.users.send_lba', id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Alert sent succesfully!');
                setLoadingBalance(null);
            },
            onError: (error) => {
                toast.error(error.message);
                setLoadingBalance(null);
            },
        });
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };
    const toggleSelect = (userId: number) => {
        setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    };

    const allSelected = selectedUserIds.length === users.length && users.length > 0;
    const toggleSelectAll = () => {
        if (allSelected) setSelectedUserIds([]);
        else setSelectedUserIds(users.map((u) => u.id));
    };

    const bulkAssignCategory = () => {
        if (selectedUserIds.length === 0) return;
        setAssigning(true);
        router.post(
            route('admin.user-categories.bulk-assign'),
            {
                user_ids: selectedUserIds,
                category_id: selectedCategoryId ? Number(selectedCategoryId) : null,
                new_category_name: newCategoryName || null,
            },
            {
                onSuccess: () => {
                    toast.success('Users moved to category');
                    setAssigning(false);
                    setCategoryModalOpen(false);
                    setSelectedCategoryId('');
                    setNewCategoryName('');
                    setSelectedUserIds([]);
                    router.reload();
                },
                onError: () => {
                    toast.error('Failed to assign category');
                    setAssigning(false);
                },
            },
        );
    };

    const createCategoryQuick = () => {
        if (!newCategoryName.trim()) return;
        router.post(
            route('admin.user-categories.store'),
            { name: newCategoryName.trim() },
            {
                onSuccess: () => {
                    toast.success('Category created');
                    router.reload({ only: ['categories'] });
                },
                onError: () => toast.error('Failed to create category'),
            },
        );
    };

    // Clear userToEdit when edit modal closes
    useEffect(() => {
        if (!editModalOpen) {
            setUserToEdit(null);
        }
    }, [editModalOpen]);

    // Close dropdown when any modal opens
    useEffect(() => {
        if (deleteModalOpen || editModalOpen || createModalOpen || categoryModalOpen) {
            setOpenDropdownId(null);
        }
    }, [deleteModalOpen, editModalOpen, createModalOpen, categoryModalOpen]);

    const handleEditClick = (user: User | EditUserModalUser) => {
        setUserToEdit(user);
        editForm.setData({
            password: '',
            email_verified_at: user.email_verified_at,
            wallet_balance: user.wallet?.balance ?? 0,
            is_active: user.is_active ?? true,
            kyc_level: user.kyc_level ?? 'BASIC',
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToEdit) return;

        setIsEditSubmitting(true);

        editForm.put(route('admin.users.update', userToEdit.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditSubmitting(false);
                setEditModalOpen(false);
                toast.success('User updated successfully');
                router.reload();
            },
            onError: () => {
                setIsEditSubmitting(false);
                toast.error('Failed to update user');
            },
        });
    };

    const deleteUser = () => {
        if (!userToDelete) return;

        setIsDeleting(true);

        router.delete(route('admin.users.destroy', { user: userToDelete.id }), {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setIsDeleting(false);
                setUserToDelete(null);
                toast.success('User deleted successfully');
            },
            onError: (errors) => {
                console.error('Error deleting user:', errors);
                setIsDeleting(false);
                setDeleteModalOpen(false);

                // Show specific error messages if available
                if (errors.message) {
                    toast.error(errors.message);
                } else if (errors.error) {
                    toast.error(errors.error);
                } else {
                    toast.error('Failed to delete user');
                }
            },
        });
    };

    // const toggleFeature = (userId: number, feature: string, value: boolean) => {
    //     router.patch(
    //         route('admin.users.toggle-feature', userId),
    //         {
    //             feature,
    //             value,
    //         },
    //         {
    //             preserveScroll: true,
    //             preserveState: true,
    //             onSuccess: () => {
    //                 toast.success('Feature updated successfully');
    //             },
    //             onError: () => {
    //                 toast.error('Failed to update feature');
    //             },
    //         },
    //     );
    // };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={activeRole ? `${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}s` : 'Users'} />

                <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-6">
                    <div className="mb-6 space-y-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div />
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCreateModalOpen(true);
                                }}
                            >
                                Add User
                            </Button>
                        </div>

                        {/* Filters Row */}
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                            <div className="w-full md:max-w-sm">
                                <Input placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Select
                                    value={(date ?? 'all') as unknown as string}
                                    onValueChange={(v) => {
                                        if (v === 'all') {
                                            setDate(undefined);
                                        } else {
                                            setDate(v as DateFilter);
                                        }
                                        setTimeout(applyFilters, 0);
                                    }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Date filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Dates</SelectItem>
                                        <SelectItem value="today">Today</SelectItem>
                                        <SelectItem value="yesterday">Yesterday</SelectItem>
                                        <SelectItem value="this_week">This Week</SelectItem>
                                        <SelectItem value="last_week">Last Week</SelectItem>
                                        <SelectItem value="this_month">This Month</SelectItem>
                                        <SelectItem value="last_month">Last Month</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={selectedRole}
                                    onValueChange={(v) => {
                                        setSelectedRole(v);
                                        router.get(getUsersRoute(v), params, { preserveState: true, replace: true });
                                    }}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Role filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="ml-auto flex gap-2">
                                <Button variant="outline" onClick={applyFilters}>
                                    Apply
                                </Button>
                                <Button variant="ghost" onClick={clearFilters}>
                                    <X className="mr-2 h-4 w-4" />
                                    Clear
                                </Button>
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={!categoryId ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setCategoryId(undefined);
                                    router.get(
                                        activeRole ? route('admin.users.by-role', activeRole) : route('admin.users.index'),
                                        buildParamsNow({ category_id: '' }),
                                        { preserveState: true, replace: true },
                                    );
                                }}
                            >
                                All Categories
                            </Button>
                            <Button
                                variant={categoryId === 'uncategorized' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => {
                                    setCategoryId('uncategorized');
                                    router.get(
                                        activeRole ? route('admin.users.by-role', activeRole) : route('admin.users.index'),
                                        buildParamsNow({ category_id: 'uncategorized' }),
                                        { preserveState: true, replace: true },
                                    );
                                }}
                            >
                                Uncategorized
                            </Button>
                            {(categories ?? []).map((c) => (
                                <Button
                                    key={c.id}
                                    variant={categoryId === String(c.id) ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        const id = String(c.id);
                                        setCategoryId(id);
                                        router.get(
                                            activeRole ? route('admin.users.by-role', activeRole) : route('admin.users.index'),
                                            buildParamsNow({ category_id: id }),
                                            { preserveState: true, replace: true },
                                        );
                                    }}
                                >
                                    {c.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {users.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="mb-4 text-gray-500">No users found</p>
                            <Link href={route('admin.users.create')}>
                                <Button>Add User</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-full">
                                            <thead className="bg-accent/50">
                                                <tr className="border-b">
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                        <input
                                                            aria-label="Select all users"
                                                            type="checkbox"
                                                            checked={allSelected}
                                                            onChange={toggleSelectAll}
                                                        />
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                        <button
                                                            type="button"
                                                            aria-label="Sort by name"
                                                            className="inline-flex cursor-pointer items-center gap-1 select-none"
                                                            onClick={() => onSort('name')}
                                                        >
                                                            Name
                                                            {sortBy === 'name' && (
                                                                <ArrowDownUp className={`h-3 w-3 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                                                            )}
                                                        </button>
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                        Email
                                                    </th>
                                                    <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6 md:table-cell">
                                                        KYC Level
                                                    </th>
                                                    {/* <th className="hidden px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6 lg:table-cell">
                                                        Features
                                                    </th> */}

                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                        <button
                                                            type="button"
                                                            aria-label="Sort by balance"
                                                            className="inline-flex cursor-pointer items-center gap-1 select-none"
                                                            onClick={() => onSort('balance')}
                                                        >
                                                            Balance
                                                            {sortBy === 'balance' && (
                                                                <ArrowDownUp className={`h-3 w-3 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                                                            )}
                                                        </button>
                                                    </th>
                                                    <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6 lg:table-cell">
                                                        Phone Numbers
                                                    </th>
                                                    <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6 lg:table-cell">
                                                        Last Activity | IP Address
                                                    </th>

                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                        <button
                                                            type="button"
                                                            aria-label="Sort by date created"
                                                            className="inline-flex cursor-pointer items-center gap-1 select-none"
                                                            onClick={() => onSort('created_at')}
                                                        >
                                                            Created
                                                            {sortBy === 'created_at' && (
                                                                <ArrowDownUp className={`h-3 w-3 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                                                            )}
                                                        </button>
                                                    </th>
                                                    <th className="px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-accent/50 divide-y divide-gray-200 dark:divide-gray-700">
                                                {users.map((user) => (
                                                    <tr key={user.id} className="hover:bg-accent">
                                                        <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                            <input
                                                                aria-label={`Select user ${user.name}`}
                                                                type="checkbox"
                                                                checked={selectedUserIds.includes(user.id)}
                                                                onChange={() => toggleSelect(user.id)}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                            <div className="flex flex-col">
                                                                <Link
                                                                    href={`/admin/users/${user.id}`}
                                                                    className="font-medium text-gray-900 hover:underline dark:text-white"
                                                                >
                                                                    {user.name}
                                                                </Link>
                                                                {/* Show phone on mobile under name */}

                                                                {user.role === 'admin' && (
                                                                    <div>
                                                                        <span
                                                                            className={`inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold ${
                                                                                user.role === 'admin'
                                                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
                                                                                    : user.role === 'owner'
                                                                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                                                                      : 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                                            }`}
                                                                        >
                                                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                                                    <span className="max-w-[120px] truncate sm:max-w-none">{user.email}</span>
                                                                    {user.email_verified_at && user.is_active && (
                                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-800 dark:text-green-100">
                                                                            ✓
                                                                        </span>
                                                                    )}
                                                                    {!user.is_active && (
                                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-800 dark:text-red-100">
                                                                            ✗
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    {user.phone_number || '-'}
                                                                </div>

                                                                {/* Show stats on mobile under email */}
                                                                <div className="flex gap-4 text-xs text-gray-500 lg:hidden">
                                                                    <span>
                                                                        SIMs: {user.connected_phone_numbers_count}/{user.disconnected_phone_numbers_count}
                                                                    </span>
                                                                    <span>Txns: {user.transactions_count}</span>
                                                                    <span className="md:hidden">
                                                                        KYC:{' '}
                                                                        {user.kyc_level === 'BASIC'
                                                                            ? 'Basic'
                                                                            : user.kyc_level === 'LEVEL1'
                                                                              ? 'L1'
                                                                              : user.kyc_level === 'LEVEL2'
                                                                                ? 'L2'
                                                                                : user.kyc_level === 'LEVEL3'
                                                                                  ? 'L3'
                                                                                  : 'Basic'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="hidden px-3 py-4 whitespace-nowrap sm:px-6 md:table-cell">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                                        user.kyc_level === 'LEVEL3'
                                                                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                                            : user.kyc_level === 'LEVEL2'
                                                                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                                                                              : user.kyc_level === 'LEVEL1'
                                                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                                                                    }`}
                                                                >
                                                                    {user.kyc_level === 'BASIC'
                                                                        ? 'Basic'
                                                                        : user.kyc_level === 'LEVEL1'
                                                                          ? 'Level 1'
                                                                          : user.kyc_level === 'LEVEL2'
                                                                            ? 'Level 2'
                                                                            : user.kyc_level === 'LEVEL3'
                                                                              ? 'Level 3'
                                                                              : 'Basic'}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                ₦{formatToThousands(user.wallet.balance)}
                                                            </div>
                                                        </td>
                                                        <td className="hidden px-3 py-4 whitespace-nowrap sm:px-6 lg:table-cell">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">
                                                                        {user.connected_phone_numbers_count}/^{user.disconnected_phone_numbers_count}
                                                                    </span>
                                                                    <span>Txns: {user.transactions_count}</span>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="hidden px-3 py-4 whitespace-nowrap sm:px-6 lg:table-cell">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {user.current_session?.last_activity || 'Never'} |{' '}
                                                                {user.current_session?.ip_address || 'N/A'}
                                                            </div>
                                                        </td>

                                                        <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {new Date(user.created_at).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4 text-right text-sm font-medium whitespace-nowrap sm:px-6">
                                                            <DropdownMenu
                                                                open={openDropdownId === user.id}
                                                                onOpenChange={(open) => setOpenDropdownId(open ? user.id : null)}
                                                            >
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                                        <span className="sr-only">Open menu</span>
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent
                                                                    align="end"
                                                                    className="w-[160px]"
                                                                    sideOffset={5}
                                                                    alignOffset={-5}
                                                                    avoidCollisions={true}
                                                                    collisionPadding={{ top: 8, right: 8, bottom: 8, left: 8 }}
                                                                    sticky="partial"
                                                                >
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={route('admin.users.show', user.id)} className="flex items-center">
                                                                            <Eye className="mr-2 h-4 w-4" />
                                                                            View
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditClick(user);
                                                                        }}
                                                                        className="flex cursor-pointer items-center"
                                                                    >
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem asChild>
                                                                        <Link
                                                                            href={route('admin.impersonate', user.id)}
                                                                            className="flex items-center"
                                                                        >
                                                                            <LogIn className="mr-2 h-4 w-4" />
                                                                            Login as User
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            sendLBA(user.id);
                                                                        }}
                                                                        disabled={loadingBalance === user.id}
                                                                        className="flex items-center"
                                                                    >
                                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                                        Send LBA
                                                                        {loadingBalance === user.id && (
                                                                            <RefreshCw className="ml-auto h-3 w-3 animate-spin" />
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteClick(user);
                                                                        }}
                                                                        className="flex items-center text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="mt-3 flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    disabled={selectedUserIds.length === 0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCategoryModalOpen(true);
                                    }}
                                >
                                    Move to Category ({selectedUserIds.length})
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>

            {/* Category Modal */}
            <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Move Users to Category</DialogTitle>
                        <DialogDescription>Select an existing category or create a new one.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div>
                            <div className="mb-1 text-sm font-medium">Existing Category</div>
                            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(categories ?? []).map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <div className="mb-1 text-sm font-medium">Or Create New</div>
                            <Input placeholder="New category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter className="flex space-x-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCategoryModalOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="button" variant="secondary" onClick={createCategoryQuick} disabled={!newCategoryName.trim()}>
                            Create Category
                        </Button>
                        <Button
                            type="button"
                            onClick={bulkAssignCategory}
                            disabled={assigning || (selectedCategoryId === '' && !newCategoryName.trim())}
                        >
                            {assigning ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Moving...
                                </>
                            ) : (
                                'Move'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this user? This action cannot be undone.</DialogDescription>
                    </DialogHeader>

                    {userToDelete && (
                        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Trash2 className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{userToDelete.name}</h3>
                                    <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                                        <p>{userToDelete.email}</p>
                                        <p className="mt-1">
                                            <strong>This will permanently delete:</strong>
                                        </p>
                                        <ul className="mt-1 list-inside list-disc">
                                            <li>
                                                {userToDelete.phone_numbers_count} phone number(s) ({userToDelete.connected_phone_numbers_count}{' '}
                                                connected, {userToDelete.disconnected_phone_numbers_count} disconnected)
                                            </li>
                                            <li>{userToDelete.transactions_count} transaction(s)</li>
                                            <li>Wallet balance: ₦{formatToThousands(userToDelete.wallet.balance)}</li>
                                            <li>All associated data</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex space-x-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModalOpen(false);
                            }}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={deleteUser} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create User Modal */}
            <CreateUserModal open={createModalOpen} onOpenChange={setCreateModalOpen} />

            {/* Edit User Modal */}
            <EditUserModal
                key={userToEdit?.id || 'empty'}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                user={userToEdit}
                editForm={editForm}
                isEditSubmitting={isEditSubmitting}
                onSubmit={handleEditSubmit}
            />
        </>
    );
}
