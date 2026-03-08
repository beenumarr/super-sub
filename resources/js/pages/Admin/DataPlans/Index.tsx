import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Edit, Plus, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface DataPlanCategory {
    id: number;
    name: string;
    description: string;
    network_id: number;
    status: string;
}

interface DataPlan {
    id: number;
    name: string;
    validity: number | null;
    size: number;
    volume: 'MB' | 'GB' | 'TB';
    description: string | null;
    api_id: string;
    telco_price: number;
    price: number;
    data_plan_category_id: number;
    status: 'ACTIVE' | 'INACTIVE';
    service_charge_type: 'percentage' | 'amount' | 'default';
    service_charge_amount: number | null;
    percentage_caped_amount: number | null;
    dispense_channel: string | null;
    category: {
        id: number;
        name: string;
        network_id: number;
        network?: {
            id: number;
            name: string;
            status: string;
        };
    };
    created_at: string;
    updated_at: string;
}

interface Network {
    id: number;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

interface DataPlansProps {
    dataPlans: DataPlan[];
    categories: DataPlanCategory[];
    networks: Network[];
    filters: {
        network: string;
    };
}

export default function DataPlans({ dataPlans, categories, networks, filters }: DataPlansProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingPlan, setEditingPlan] = useState<DataPlan | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<DataPlan | null>(null);
    const [selectedNetwork, setSelectedNetwork] = useState<string>(filters.network || '');

    const [modalNetworkFilter, setModalNetworkFilter] = useState<string>('all');

    const form = useForm<{
        id: string;
        name: string;
        validity: string;
        size: string;
        volume: string;
        description: string;
        dispense_channel: string;
        telco_price: string;
        api_id: string;
        price: string;
        data_plan_category_id: string;
        status: string;
        service_charge_type: 'percentage' | 'amount' | 'default';
        service_charge_amount: string | null;
        percentage_caped_amount: string | null;
    }>({
        id: '',
        name: '',
        validity: '',
        size: '',
        volume: 'GB',
        description: '',
        dispense_channel: '',
        telco_price: '',
        api_id: '',
        price: '',
        data_plan_category_id: '',
        status: 'ACTIVE',
        service_charge_type: 'default',
        service_charge_amount: '',
        percentage_caped_amount: '',
    });

    const openCreateModal = () => {
        form.reset();
        setEditingPlan(null);
        setModalNetworkFilter(selectedNetwork || 'all');
        setIsModalOpen(true);
    };

    const openEditModal = (plan: DataPlan) => {
        form.setData({
            id: plan.id.toString(),
            name: plan.name,
            validity: plan.validity?.toString() || '',
            size: plan.size.toString(),
            volume: plan.volume,
            description: plan.description || '',
            dispense_channel: plan.dispense_channel || '',
            telco_price: plan.telco_price.toString(),
            api_id: plan.api_id || '',
            price: plan.price.toString(),
            data_plan_category_id: plan.data_plan_category_id.toString(),
            status: plan.status,
            service_charge_type: plan.service_charge_type || 'default',
            service_charge_amount: plan.service_charge_amount?.toString() || '',
            percentage_caped_amount: plan.percentage_caped_amount?.toString() || '',
        });
        setModalNetworkFilter(plan.category?.network_id?.toString() ?? 'all');
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const openDeleteDialog = (plan: DataPlan) => {
        setPlanToDelete(plan);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data - convert empty strings to null, parseFloat for numbers
        const submitData: Record<string, string | number | null | boolean> = {
            name: form.data.name,
            validity: form.data.validity,
            size: form.data.size,
            volume: form.data.volume,
            description: form.data.description,
            dispense_channel: form.data.dispense_channel,
            telco_price: form.data.telco_price,
            api_id: form.data.api_id,
            price: form.data.price,
            data_plan_category_id: form.data.data_plan_category_id,
            status: form.data.status,
            service_charge_type: form.data.service_charge_type,
            service_charge_amount:
                form.data.service_charge_amount && form.data.service_charge_amount !== ''
                    ? parseFloat(form.data.service_charge_amount.toString())
                    : null,
            percentage_caped_amount:
                form.data.percentage_caped_amount && form.data.percentage_caped_amount !== ''
                    ? parseFloat(form.data.percentage_caped_amount.toString())
                    : null,
        };

        if (editingPlan) {
            router.put(route('data-plans.update', editingPlan.id), submitData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Data plan updated successfully');
                },
                onError: (errors) => {
                    console.error(errors);
                    Object.keys(errors).forEach((key) => {
                        toast.error(errors[key]);
                    });
                },
            });
        } else {
            router.post(route('data-plans.store'), submitData, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Data plan created successfully');
                },
                onError: (errors) => {
                    console.error(errors);
                    Object.keys(errors).forEach((key) => {
                        toast.error(errors[key]);
                    });
                },
            });
        }
    };

    const handleDelete = () => {
        if (!planToDelete) return;

        setIsDeleting(true);

        router.delete(route('data-plans.destroy', planToDelete.id), {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setIsDeleting(false);
                toast.success('Data plan deleted successfully');
            },
            onError: (error) => {
                console.error('Error deleting data plan:', error);
                toast.error('Failed to delete data plan');
                setIsDeleting(false);
                setDeleteDialogOpen(false);
            },
        });
    };

    const handleNetworkChange = (networkId: string) => {
        setSelectedNetwork(networkId);
        router.get(
            route('data-plans.index'),
            { network: networkId },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Data Plans Management" />

            <div className="px-2 py-6 lg:px-0">
                <div className="mx-auto sm:px-6 lg:px-8">
                    <div className="border-accent/70 mb-6 flex items-center justify-between border-b pb-4">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Data Plans Management</h2>
                        </div>
                        <Button onClick={openCreateModal} variant="secondary" className="bg-theme-1 hover:bg-theme-1/90 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Plan
                        </Button>
                    </div>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        {networks.map((network) => (
                            <Button
                                key={network.id}
                                variant={selectedNetwork === network.id.toString() ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleNetworkChange(network.id.toString())}
                                disabled={network.status === 'INACTIVE'}
                                className={selectedNetwork === network.id.toString() ? 'bg-theme-1 hover:bg-theme-1/90 text-white' : ''}
                            >
                                {network.name}
                            </Button>
                        ))}
                    </div>

                    <Card className="bg-accent/40 w-full rounded-none py-0 shadow">
                        <CardContent className="w-full overflow-x-auto p-0">
                            {dataPlans.length === 0 ? (
                                <div className="py-8 text-center">
                                    <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">
                                        {selectedNetwork && selectedNetwork !== '' ? 'No Data Plans for Selected Network' : 'No Data Plans'}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {selectedNetwork && selectedNetwork !== ''
                                            ? 'No data plans found for the selected network provider.'
                                            : "You haven't added any data plans yet."}
                                    </p>
                                    <div className="mt-6">
                                        <Button onClick={openCreateModal} variant="secondary" className="bg-theme-1 hover:bg-theme-1/90 text-white">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add New Plan
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Table className="w-full">
                                    <TableHeader>
                                        <TableRow className="bg-accent px-2">
                                            <TableHead>Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead>Validity</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Telco Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Dispense Channel</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dataPlans.map((plan) => (
                                            <TableRow key={plan.id}>
                                                <TableCell className="font-medium">{plan.name}</TableCell>
                                                <TableCell>{plan.category.name}</TableCell>
                                                <TableCell>{`${plan.size} ${plan.volume}`}</TableCell>
                                                <TableCell>{plan.validity ? `${plan.validity} days` : 'N/A'}</TableCell>
                                                <TableCell>₦{plan.price}</TableCell>
                                                <TableCell>₦{plan.telco_price}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            plan.status === 'ACTIVE'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                        }
                                                    >
                                                        {plan.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {plan.dispense_channel && plan.dispense_channel !== 'none' && (
                                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                                            {plan.dispense_channel}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(plan)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(plan)}>
                                                            <Trash className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Edit Data Plan' : 'Add New Data Plan'}</DialogTitle>
                        <DialogDescription>Fill in the details to {editingPlan ? 'update the' : 'create a new'} data plan.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="e.g. Daily 1GB Plan"
                                    required
                                />
                                {form.errors.name && <p className="text-sm text-red-500">{form.errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="data_plan_category_id">Category</Label>
                                <Select
                                    value={form.data.data_plan_category_id}
                                    onValueChange={(value) => form.setData('data_plan_category_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories
                                            .filter((category) => modalNetworkFilter === 'all' || category.network_id?.toString() === modalNetworkFilter)
                                            .map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.data_plan_category_id && <p className="text-sm text-red-500">{form.errors.data_plan_category_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="modal_network_filter">Network (filter categories)</Label>
                                <Select value={modalNetworkFilter} onValueChange={setModalNetworkFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All networks" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All networks</SelectItem>
                                        {networks.map((network) => (
                                            <SelectItem key={network.id} value={network.id.toString()} disabled={network.status === 'INACTIVE'}>
                                                {network.name} {network.status === 'INACTIVE' ? '(Inactive)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="size">Size</Label>
                                <Input
                                    id="size"
                                    type="number"
                                    value={form.data.size}
                                    onChange={(e) => form.setData('size', e.target.value)}
                                    placeholder="e.g. 1000"
                                    required
                                />
                                {form.errors.size && <p className="text-sm text-red-500">{form.errors.size}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="volume">Volume</Label>
                                <Select value={form.data.volume} onValueChange={(value) => form.setData('volume', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select volume unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MB">MB</SelectItem>
                                        <SelectItem value="GB">GB</SelectItem>
                                        <SelectItem value="TB">TB</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.errors.volume && <p className="text-sm text-red-500">{form.errors.volume}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="validity">Validity (days)</Label>
                                <Input
                                    id="validity"
                                    type="number"
                                    value={form.data.validity}
                                    onChange={(e) => form.setData('validity', e.target.value)}
                                    placeholder="e.g. 30"
                                />
                                {form.errors.validity && <p className="text-sm text-red-500">{form.errors.validity}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dispense_channel">Dispense Channel</Label>
                                <Select value={form.data.dispense_channel} onValueChange={(value) => form.setData('dispense_channel', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select dispense channel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WALLET">Wallet</SelectItem>
                                        <SelectItem value="SIM">SIM</SelectItem>
                                        <SelectItem value="SMARTCASH_WALLET">Smartcash Wallet</SelectItem>
                                        <SelectItem value="SMARTCASH_AIRTIME">Smartcash Airtime</SelectItem>
                                        <SelectItem value="MOMO">MTN Momo</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.errors.dispense_channel && <p className="text-sm text-red-500">{form.errors.dispense_channel}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api_id">API ID</Label>
                                <Input
                                    id="api_id"
                                    value={form.data.api_id}
                                    onChange={(e) => form.setData('api_id', e.target.value)}
                                    placeholder="e.g. pla_id"
                                />
                                {form.errors.api_id && <p className="text-sm text-red-500">{form.errors.api_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₦)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={form.data.price}
                                    onChange={(e) => form.setData('price', e.target.value)}
                                    placeholder="e.g. 1000"
                                    required
                                />
                                {form.errors.price && <p className="text-sm text-red-500">{form.errors.price}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telco_price">Telco Price (₦)</Label>
                                <Input
                                    id="telco_price"
                                    type="number"
                                    value={form.data.telco_price}
                                    onChange={(e) => form.setData('telco_price', e.target.value)}
                                    placeholder="e.g. 950"
                                    required
                                />
                                {form.errors.telco_price && <p className="text-sm text-red-500">{form.errors.telco_price}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.errors.status && <p className="text-sm text-red-500">{form.errors.status}</p>}
                            </div>
                        </div>

                        {/* Service Charge Settings */}
                        <div className="space-y-3 border-t pt-4">
                            <Label className="text-sm font-medium">Service Charge</Label>
                            <div>
                                <Label className="text-sm text-gray-600">Charge Type</Label>
                                <Select
                                    value={form.data.service_charge_type}
                                    onValueChange={(value: 'percentage' | 'amount' | 'default') => {
                                        form.setData('service_charge_type', value);
                                        if (value === 'default') {
                                            form.setData('service_charge_amount', '');
                                            form.setData('percentage_caped_amount', '');
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select charge type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default (Use Category)</SelectItem>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="amount">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.errors.service_charge_type && <p className="text-sm text-red-500">{form.errors.service_charge_type}</p>}
                            </div>

                            {form.data.service_charge_type !== 'default' && (
                                <>
                                    <div>
                                        <Label className="text-sm text-gray-600">
                                            {form.data.service_charge_type === 'percentage' ? 'Percentage (%)' : 'Amount (₦)'}
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={form.data.service_charge_amount || ''}
                                            onChange={(e) => form.setData('service_charge_amount', e.target.value || null)}
                                            placeholder={form.data.service_charge_type === 'percentage' ? 'e.g. 5.5' : 'e.g. 100'}
                                        />
                                        {form.errors.service_charge_amount && (
                                            <p className="text-sm text-red-500">{form.errors.service_charge_amount}</p>
                                        )}
                                    </div>

                                    {form.data.service_charge_type === 'percentage' && (
                                        <div>
                                            <Label className="text-sm text-gray-600">Cap Amount (₦)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={form.data.percentage_caped_amount || ''}
                                                onChange={(e) => form.setData('percentage_caped_amount', e.target.value || null)}
                                                placeholder="e.g. 1000"
                                            />
                                            {form.errors.percentage_caped_amount && (
                                                <p className="text-sm text-red-500">{form.errors.percentage_caped_amount}</p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('description', e.target.value)}
                                placeholder="Enter a description for this data plan"
                                rows={3}
                            />
                            {form.errors.description && <p className="text-sm text-red-500">{form.errors.description}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-theme-1 hover:bg-theme-1/90 text-white" disabled={form.processing}>
                                {form.processing ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Data Plan</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this data plan? This action cannot be undone.</DialogDescription>
                    </DialogHeader>

                    {planToDelete && (
                        <div className="rounded-md bg-red-50 p-4 text-sm dark:bg-red-900/20">
                            <p className="font-medium text-red-800 dark:text-red-200">
                                {planToDelete.name} - {planToDelete.size} {planToDelete.volume}
                            </p>
                            <p className="mt-1 text-red-700 dark:text-red-300">Category: {planToDelete.category.name}</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete Plan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
