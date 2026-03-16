import { Edit, MoreHorizontal, RefreshCw, Trash2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    permissions_count: number;
}

interface RoleProps {
    roles: Role[];
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Roles', href: '/admin/roles' },
];

export default function RolesIndex({ roles: initialRoles, permissions }: RoleProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [roles, setRoles] = useState(initialRoles);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [editPermissions, setEditPermissions] = useState<number[]>([]);

    // Close dropdown when any modal opens
    useEffect(() => {
        if (deleteModalOpen || editModalOpen || createModalOpen) {
            setOpenDropdownId(null);
        }
    }, [deleteModalOpen, editModalOpen, createModalOpen]);

    // Clear forms when modals close
    useEffect(() => {
        if (!createModalOpen) {
            createForm.reset();
            setSelectedPermissions([]);
        }
    }, [createModalOpen]);

    useEffect(() => {
        if (!editModalOpen) {
            setRoleToEdit(null);
            setEditPermissions([]);
        }
    }, [editModalOpen]);

    const createForm = useForm<{ name: string }>({
        name: '',
    });

    const editForm = useForm<{ name: string }>({
        name: '',
    });

    const handleDeleteClick = (role: Role) => {
        setRoleToDelete(role);
        setDeleteModalOpen(true);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!createForm.data.name.trim()) {
            toast.error('Role name is required');
            return;
        }
        if (selectedPermissions.length === 0) {
            toast.error('Please select at least one permission');
            return;
        }

        setIsCreateSubmitting(true);

        fetch('/admin/roles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                name: createForm.data.name,
                permissions: selectedPermissions,
            }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create role');
                }
                return response.json();
            })
            .then(() => {
                setIsCreateSubmitting(false);
                setCreateModalOpen(false);
                createForm.reset();
                setSelectedPermissions([]);
                toast.success('Role created successfully');
                router.reload();
            })
            .catch((error) => {
                setIsCreateSubmitting(false);
                toast.error(error.message || 'Failed to create role');
            });
    };

    const handleEditClick = (role: Role) => {
        setRoleToEdit(role);
        editForm.setData('name', role.name);

        // Fetch role permissions
        fetch(`/admin/roles/${role.id}`)
            .then((res) => res.json())
            .then((data) => {
                setEditPermissions(data.permissions || []);
            })
            .catch(() => {
                toast.error('Failed to load role permissions');
            });

        setEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleToEdit) return;
        if (!editForm.data.name.trim()) {
            toast.error('Role name is required');
            return;
        }
        if (editPermissions.length === 0) {
            toast.error('Please select at least one permission');
            return;
        }

        setIsEditSubmitting(true);

        fetch(`/admin/roles/${roleToEdit.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                name: editForm.data.name,
                permissions: editPermissions,
            }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update role');
                }
                return response.json();
            })
            .then(() => {
                setIsEditSubmitting(false);
                setEditModalOpen(false);
                toast.success('Role updated successfully');
                router.reload();
            })
            .catch((error) => {
                setIsEditSubmitting(false);
                toast.error(error.message || 'Failed to update role');
            });
    };

    const deleteRole = () => {
        if (!roleToDelete) return;

        setIsDeleting(true);

        fetch(`/admin/roles/${roleToDelete.id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete role');
                }
                return response.json();
            })
            .then(() => {
                toast.success('Role deleted successfully');
                setDeleteModalOpen(false);
                setIsDeleting(false);
                setRoleToDelete(null);
                router.reload();
            })
            .catch(() => {
                setIsDeleting(false);
                toast.error('Failed to delete role');
            });
    };

    // Filter roles based on search
    const filteredRoles = useMemo(() => {
        if (!search.trim()) return roles;
        const searchLower = search.toLowerCase();
        return roles.filter((role) => role.name.toLowerCase().includes(searchLower));
    }, [roles, search]);

    // Export roles to CSV
    const exportToCSV = () => {
        const headers = ['Role Name', 'Permissions Count', 'Created Date'];
        const rows = filteredRoles.map((role) => [
            role.name,
            role.permissions_count,
            new Date(role.created_at).toLocaleDateString(),
        ]);

        let csvContent = headers.join(',') + '\n';
        rows.forEach((row) => {
            const escapedRow = row.map((cell) => {
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
        link.setAttribute('download', `roles_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Roles data exported successfully');
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Role Management" />

                <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-6">
                    <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight dark:text-white">Role Management</h1>
                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                Create and manage roles with specific permissions
                            </p>
                        </div>
                        <Button onClick={() => setCreateModalOpen(true)}>Add Role</Button>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                        <div className="w-full md:max-w-sm">
                            <Input
                                placeholder="Search roles..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button onClick={exportToCSV} variant="outline" className="gap-2">
                            Export
                        </Button>
                    </div>

                    {filteredRoles.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="mb-4 text-gray-500 dark:text-gray-400">
                                {search ? 'No roles match your search' : 'No roles found'}
                            </p>
                            <Button onClick={() => setCreateModalOpen(true)}>Add Role</Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Card>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-900/40">
                                                <tr className="border-b border-gray-200 dark:border-gray-800">
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-300 uppercase sm:px-6">
                                                        Role Name
                                                    </th>
                                                    <th className="hidden px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-300 uppercase sm:px-6 lg:table-cell">
                                                        Permissions
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 dark:text-gray-300 uppercase sm:px-6">
                                                        Created
                                                    </th>
                                                    <th className="px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-500 dark:text-gray-300 uppercase sm:px-6">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                                {filteredRoles.map((role) => (
                                                    <tr key={role.id} className="bg-white dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-900">
                                                        <td className="px-3 py-4 whitespace-nowrap sm:px-6">
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {role.name}
                                                            </span>
                                                        </td>
                                                        <td className="hidden px-3 py-4 whitespace-nowrap sm:px-6 lg:table-cell">
                                                            <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                                                {role.permissions_count} permissions
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap sm:px-6 text-sm text-gray-600 dark:text-gray-400">
                                                            {new Date(role.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap text-right sm:px-6">
                                                            <DropdownMenu
                                                                open={openDropdownId === role.id}
                                                                onOpenChange={(open) => setOpenDropdownId(open ? role.id : null)}
                                                            >
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleEditClick(role)}>
                                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleDeleteClick(role)} className="text-red-600">
                                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                </div>

                {/* Delete Confirmation Modal */}
                <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Role</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex space-x-2 sm:justify-end pt-4">
                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deleteRole} disabled={isDeleting}>
                                {isDeleting ? (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Role Modal */}
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Role</DialogTitle>
                            <DialogDescription>Update role details and permissions</DialogDescription>
                        </DialogHeader>
                        {editModalOpen && (
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Role Name
                                    </label>
                                    <Input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        placeholder="Enter role name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Permissions ({editPermissions.length} selected)
                                    </label>
                                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-md p-4 space-y-2 dark:bg-gray-900/20">
                                        {permissions.map((permission) => (
                                            <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                                                <Checkbox
                                                    checked={editPermissions.includes(permission.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setEditPermissions([...editPermissions, permission.id]);
                                                        } else {
                                                            setEditPermissions(editPermissions.filter((id) => id !== permission.id));
                                                        }
                                                    }}
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{permission.name}</span>
                                            </label>
                                        ))}
                                    </div>
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

                {/* Create Role Modal */}
                <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>Add a new role with specific permissions</DialogDescription>
                        </DialogHeader>
                        {createModalOpen && (
                            <form onSubmit={handleCreateSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Role Name
                                    </label>
                                    <Input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Enter role name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Permissions ({selectedPermissions.length} selected)
                                    </label>
                                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-md p-4 space-y-2 dark:bg-gray-900/20">
                                        {permissions.map((permission) => (
                                            <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                                                <Checkbox
                                                    checked={selectedPermissions.includes(permission.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedPermissions([...selectedPermissions, permission.id]);
                                                        } else {
                                                            setSelectedPermissions(
                                                                selectedPermissions.filter((id) => id !== permission.id)
                                                            );
                                                        }
                                                    }}
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{permission.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <DialogFooter className="flex space-x-2 sm:justify-end pt-4">
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
                                            'Create Role'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </>
    );
}
