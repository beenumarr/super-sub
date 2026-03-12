import {
    ArrowDownUp,
    Edit,
    Eye,
    LogIn,
    MoreHorizontal,
    RefreshCw,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { formatToThousands } from '@/utils';

interface Role {
    id: number;
    name: string;
}

interface Wallet {
    balance: number;
}

interface Staff {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    wallet: Wallet;
    roles: Role[];
    email_verified_at: string | null;
    is_active: boolean;
    kyc_level: string;
    created_at: string;
}

interface EditStaffModalStaff {
    id: number;
    name?: string;
    email?: string;
    email_verified_at: string | null;
    wallet?: Wallet;
    is_active?: boolean;
    kyc_level?: string;
    account_status?: string;
    address?: string;
    user_package_id?: string | number;
}

interface IndexProps {
    data: Staff[];
    roles: Role[];
    packages: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Staff',
        href: '/admin/staffs',
    },
];

export default function Index({ data: staffs, roles, packages }: IndexProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [staffToEdit, setStaffToEdit] = useState<EditStaffModalStaff | null>(null);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [assigningRole, setAssigningRole] = useState<number | null>(null);

    // Dropdown state management
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    // Filters UI state
    const [search, setSearch] = useState('');

    // Close dropdown when any modal opens
    useEffect(() => {
        if (deleteModalOpen || editModalOpen || createModalOpen) {
            setOpenDropdownId(null);
        }
    }, [deleteModalOpen, editModalOpen, createModalOpen]);

    // Clear staffToEdit when edit modal closes
    useEffect(() => {
        if (!editModalOpen) {
            setStaffToEdit(null);
        }
    }, [editModalOpen]);

    // Clear createForm when create modal closes
    useEffect(() => {
        if (!createModalOpen) {
            createForm.reset();
        }
    }, [createModalOpen]);

    const editForm = useForm<{
        name: string;
        email: string;
        phone_number: string;
        is_active: boolean;
        kyc_level: string;
        account_status: string;
        address: string;
        user_package_id: string | number;
    }>({
        name: '',
        email: '',
        phone_number: '',
        is_active: true,
        kyc_level: 'basic',
        account_status: 'active',
        address: '',
        user_package_id: '',
    });

    const createForm = useForm<{
        name: string;
        email: string;
        phone_number: string;
        password: string;
        role: string;
    }>({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        role: roles.length > 0 ? String(roles[0].id) : '',
    });

    const handleDeleteClick = (staff: Staff) => {
        setStaffToDelete(staff);
        setDeleteModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreateSubmitting(true);

        createForm.post('/admin/staffs', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateSubmitting(false);
                setCreateModalOpen(false);
                createForm.reset();
                toast.success('Staff created successfully');
                router.reload();
            },
            onError: () => {
                setIsCreateSubmitting(false);
                toast.error('Failed to create staff');
            },
        });
    };

    const handleEditClick = (staff: Staff) => {
        setStaffToEdit(staff);
        editForm.setData('name', staff.name);
        editForm.setData('email', staff.email);
        editForm.setData('phone_number', staff.phone_number || '');
        editForm.setData('is_active', staff.is_active ?? true);
        editForm.setData('kyc_level', staff.kyc_level || 'basic');
        editForm.setData('account_status', (staff as any).account_status || 'active');
        editForm.setData('address', (staff as any).address || '');
        editForm.setData('user_package_id', (staff as any).user_package_id || '');
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!staffToEdit) return;

        setIsEditSubmitting(true);

        editForm.put(`/admin/staffs/${staffToEdit.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditSubmitting(false);
                setEditModalOpen(false);
                toast.success('Staff updated successfully');
                router.reload();
            },
            onError: () => {
                setIsEditSubmitting(false);
                toast.error('Failed to update staff');
            },
        });
    };

    const deleteStaff = () => {
        if (!staffToDelete) return;

        setIsDeleting(true);

        router.delete(`/admin/staffs/${staffToDelete.id}`, {
            onSuccess: () => {
                toast.success('Staff deleted successfully');
                setDeleteModalOpen(false);
                setIsDeleting(false);
                setStaffToDelete(null);
                router.reload();
            },
            onError: (errors: any) => {
                setIsDeleting(false);
                console.error('Delete error:', errors);

                let errorMessage = 'Failed to delete staff';
                if (typeof errors === 'string') {
                    errorMessage = errors;
                } else if (errors?.message) {
                    errorMessage = errors.message;
                } else if (errors?.error) {
                    errorMessage = errors.error;
                } else if (errors && Object.keys(errors).length > 0) {
                    errorMessage = Object.values(errors)[0] as string;
                }

                toast.error(errorMessage);
            },
        });
    };

    // Filter staff based on search
    const filteredStaffs = useMemo(() => {
        if (!search.trim()) return staffs;

        const searchLower = search.toLowerCase();
        return staffs.filter(staff =>
            staff.name.toLowerCase().includes(searchLower) ||
            staff.email.toLowerCase().includes(searchLower) ||
            (staff.phone_number && staff.phone_number.toLowerCase().includes(searchLower))
        );
    }, [staffs, search]);

    // Export staff data to CSV
    const exportToCSV = () => {
        const headers = ['Name', 'Email', 'Phone', 'Roles', 'Status', 'KYC Level', 'Created Date'];
        const rows = filteredStaffs.map(staff => [
            staff.name,
            staff.email,
            staff.phone_number || '',
            staff.roles?.map(r => r.name).join('; ') || '',
            staff.is_active ? 'Active' : 'Inactive',
            staff.kyc_level || '',
            new Date(staff.created_at).toLocaleDateString(),
        ]);

        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            const escapedRow = row.map(cell => {
                const cellStr = String(cell);
                return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')
                    ? `"${cellStr.replace(/"/g, '""')}"`
                    : cellStr;
            });
            csvContent += escapedRow.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `staff_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Staff data exported successfully');
    };

    const assignRole = (staffId: number, roleId: string) => {
        if (!roleId) {
            toast.error('Please select a role');
            return;
        }

        setAssigningRole(staffId);

        router.post(
            `/admin/users/${staffId}/update-role`,
            {
                user_id: staffId,
                role: roleId,
            },
            {
                onSuccess: () => {
                    toast.success('Role assigned successfully');
                    setAssigningRole(null);
                    setSelectedRoleId('');
                    router.reload();
                },
                onError: () => {
                    toast.error('Failed to assign role');
                    setAssigningRole(null);
                },
            },
        );
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Staff Management" />

                <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-6">
                    <div className="mb-6 space-y-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div />
                            <Button onClick={() => setCreateModalOpen(true)}>Add Staff</Button>
                        </div>

                        {/* Filters Row */}
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                            <div className="w-full md:max-w-sm">
                                <Input
                                    placeholder="Search name, email, phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button onClick={exportToCSV} variant="outline" className="gap-2">
                                Export
                            </Button>
                        </div>
                    </div>

                    {filteredStaffs.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="mb-4 text-gray-500">{search ? 'No staff members match your search' : 'No staff members found'}</p>
                            <Button onClick={() => setCreateModalOpen(true)}>Add Staff Member</Button>
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
                                                        Name
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                        Email
                                                    </th>
                                                    <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6 lg:table-cell">
                                                        Roles
                                                    </th>
                                                    <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6 lg:table-cell">
                                                        Status
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                        Created
                                                    </th>
                                                    <th className="px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase sm:px-6">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-accent/50 divide-y divide-gray-200 dark:divide-gray-700">
                                                {filteredStaffs.map((staff) => (
                                                    <tr key={staff.id} className="hover:bg-accent">
                                                        <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    {staff.name}
                                                                </span>
                                                                {staff.phone_number && (
                                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {staff.phone_number}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                                                <span className="max-w-[150px] truncate">
                                                                    {staff.email}
                                                                </span>
                                                                {staff.email_verified_at && staff.is_active && (
                                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-800 dark:text-green-100">
                                                                        ✓
                                                                    </span>
                                                                )}
                                                                {!staff.is_active && (
                                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-800 dark:text-red-100">
                                                                        ✗
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="hidden px-3 py-4 whitespace-nowrap sm:px-6 lg:table-cell">
                                                            <div className="flex flex-wrap gap-1">
                                                                {staff.roles && staff.roles.length > 0 ? (
                                                                    staff.roles.map((role) => (
                                                                        <span
                                                                            key={role.id}
                                                                            className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                                                                        >
                                                                            {role.name}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-gray-500">No roles</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="hidden px-3 py-4 whitespace-nowrap sm:px-6 lg:table-cell">
                                                            <span
                                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                                    staff.is_active
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                                }`}
                                                            >
                                                                {staff.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {new Date(staff.created_at).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-4 text-right text-sm font-medium whitespace-nowrap sm:px-6">
                                                            <DropdownMenu
                                                                open={openDropdownId === staff.id}
                                                                onOpenChange={(open) =>
                                                                    setOpenDropdownId(open ? staff.id : null)
                                                                }
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
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditClick(staff);
                                                                        }}
                                                                        className="flex cursor-pointer items-center"
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditClick(staff);
                                                                        }}
                                                                        className="flex cursor-pointer items-center"
                                                                    >
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem asChild>
                                                                        <Link
                                                                            href={`/admin/impersonate/${staff.id}`}
                                                                            className="flex items-center"
                                                                        >
                                                                            <LogIn className="mr-2 h-4 w-4" />
                                                                            Login as Staff
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteClick(staff);
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
                        </div>
                    )}
                </div>
            </AppLayout>

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Staff Member</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this staff member? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {staffToDelete && (
                        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Trash2 className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                        {staffToDelete.name}
                                    </h3>
                                    <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                                        <p>{staffToDelete.email}</p>
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
                        <Button type="button" variant="destructive" onClick={deleteStaff} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Staff
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Staff Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Staff Member</DialogTitle>
                        <DialogDescription>Update staff member information</DialogDescription>
                    </DialogHeader>

                    {staffToEdit && (
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name
                                </label>
                                <Input
                                    type="text"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    placeholder="Full name"
                                />
                                {editForm.errors.name && (
                                    <p className="text-sm text-red-600">{editForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    placeholder="Email address"
                                />
                                {editForm.errors.email && (
                                    <p className="text-sm text-red-600">{editForm.errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone Number
                                </label>
                                <Input
                                    type="text"
                                    value={editForm.data.phone_number}
                                    onChange={(e) => editForm.setData('phone_number', e.target.value)}
                                    placeholder="Phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Address
                                </label>
                                <Input
                                    type="text"
                                    value={editForm.data.address}
                                    onChange={(e) => editForm.setData('address', e.target.value)}
                                    placeholder="Address"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={editForm.data.is_active ? true : false}
                                        onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Active
                                    </span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    KYC Level
                                </label>
                                <Select value={editForm.data.kyc_level} onValueChange={(value) => editForm.setData('kyc_level', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select KYC Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="level1">Level 1</SelectItem>
                                        <SelectItem value="level2">Level 2</SelectItem>
                                        <SelectItem value="level3">Level 3 (Premium)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Account Status
                                </label>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={editForm.data.account_status === 'active'}
                                        onCheckedChange={(value) => editForm.setData('account_status', value ? 'active' : 'inactive')}
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {editForm.data.account_status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    User Package
                                </label>
                                <Select value={editForm.data.user_package_id?.toString() || ''} onValueChange={(value) => editForm.setData('user_package_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select User Package" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {packages.map((pkg: any) => (
                                            <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                                {pkg.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="flex space-x-2 sm:justify-end pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditModalOpen(false)}
                                    disabled={isEditSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isEditSubmitting}>
                                    {isEditSubmitting ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Staff Modal */}
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Staff Member</DialogTitle>
                        <DialogDescription>Add a new staff member to your system</DialogDescription>
                    </DialogHeader>
                    {createModalOpen && (
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name
                                </label>
                                <Input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="Staff member's full name"
                                />
                                {createForm.errors.name && (
                                    <p className="text-sm text-red-600">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    placeholder="staff@example.com"
                                />
                                {createForm.errors.email && (
                                    <p className="text-sm text-red-600">{createForm.errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Phone Number
                                </label>
                                <Input
                                    type="text"
                                    value={createForm.data.phone_number}
                                    onChange={(e) => createForm.setData('phone_number', e.target.value)}
                                    placeholder="+234 123 456 7890"
                                />
                                {createForm.errors.phone_number && (
                                    <p className="text-sm text-red-600">{createForm.errors.phone_number}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    placeholder="Enter a secure password"
                                />
                                {createForm.errors.password && (
                                    <p className="text-sm text-red-600">{createForm.errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Role
                                </label>
                                <select
                                    value={createForm.data.role}
                                    onChange={(e) => createForm.setData('role', e.target.value)}
                                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">Select a role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={String(role.id)}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                {createForm.errors.role && (
                                    <p className="text-sm text-red-600">{createForm.errors.role}</p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreateModalOpen(false)}
                                    disabled={isCreateSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isCreateSubmitting}>
                                    {isCreateSubmitting ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Staff'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
