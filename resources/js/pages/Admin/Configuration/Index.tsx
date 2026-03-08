import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Edit, ExternalLink, Settings } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Network {
    id: number;
    name: string;
    description: string | null;
    api_id: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
    updated_at: string;
}

interface Gateway {
    id: number;
    name: string;
    url: string;
    model: string;
}

interface DataPlanCategory {
    id: number;
    name: string;
    description: string | null;
    type: 'DIRECT_GIFTING' | 'DATA_SHARE' | 'AWOOF';
    status: 'ACTIVE' | 'INACTIVE';
    dispense_method: 'CLOUD' | 'DEVICE' | 'WALLET';
    gateway_id: number | null;
    enabled_channels: Record<string, boolean> | null;
    active_channel: string | null;
    service_charge_type: 'percentage' | 'amount' | 'default';
    service_charge_amount: number | null;
    percentage_caped_amount: number | null;
    network: Network;
    gateway: Gateway | null;
    created_at: string;
    updated_at: string;
}

interface ConfigurationProps {
    networks: Network[];
    dataPlanCategories: DataPlanCategory[];
    gateways: Gateway[];
    selectedNetworkId: number;
    channels: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Configuration', href: '/admin/configuration' },
];

export default function Index({ networks, dataPlanCategories, gateways, selectedNetworkId, channels }: ConfigurationProps) {
    const [activeNetwork, setActiveNetwork] = useState<number>(selectedNetworkId);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [categoryEditModalOpen, setCategoryEditModalOpen] = useState(false);
    const [networkToEdit, setNetworkToEdit] = useState<Network | null>(null);
    const [categoryToEdit, setCategoryToEdit] = useState<DataPlanCategory | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        api_id: '',
        status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    });

    const {
        data: categoryData,
        setData: setCategoryData,
        processing: categoryProcessing,
        errors: categoryErrors,
        reset: resetCategory,
    } = useForm<{
        name: string;
        description: string;
        type: 'DIRECT_GIFTING' | 'DATA_SHARE' | 'AWOOF';
        status: 'ACTIVE' | 'INACTIVE';
        dispense_method: 'CLOUD' | 'DEVICE' | 'WALLET';
        service_charge_type: 'percentage' | 'amount' | 'default';
        service_charge_amount: string | null;
        percentage_caped_amount: string | null;
        gateway_id: string | null;
    }>({
        name: '',
        description: '',
        type: 'DATA_SHARE',
        status: 'ACTIVE',
        dispense_method: 'CLOUD',
        service_charge_type: 'default',
        service_charge_amount: '',
        percentage_caped_amount: '',
        gateway_id: '',
    });

    const selectedNetwork = networks.find((n) => n.id === activeNetwork);
    const networkCategories = dataPlanCategories.filter((cat) => cat.network.id === activeNetwork);

    const handleNetworkSelect = (networkId: number) => {
        setActiveNetwork(networkId);
    };

    const handleEditClick = (network: Network) => {
        setNetworkToEdit(network);
        setData({
            name: network.name,
            description: network.description || '',
            api_id: network.api_id || '',
            status: network.status,
        });
        setEditModalOpen(true);
    };

    const handleCategoryEditClick = (category: DataPlanCategory) => {
        setCategoryToEdit(category);
        setCategoryData({
            name: category.name,
            description: category.description || '',
            type: category.type,
            status: category.status,
            dispense_method: category.dispense_method,
            service_charge_type: category.service_charge_type || 'default',
            service_charge_amount: category.service_charge_amount?.toString() || '',
            percentage_caped_amount: category.percentage_caped_amount?.toString() || '',
            gateway_id: category.gateway_id?.toString() || '',
        });
        setCategoryEditModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!networkToEdit) return;

        put(route('admin.networks.update', networkToEdit.id), {
            onSuccess: () => {
                toast.success('Network updated');
                setEditModalOpen(false);
                setNetworkToEdit(null);
                reset();
            },
            onError: () => toast.error('Failed to update network'),
        });
    };

    const handleCategorySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryToEdit) return;

        // Prepare data - convert empty strings to null, keep numbers as strings for form
        const submitData: Record<string, string | number | null> = {
            name: categoryData.name,
            description: categoryData.description,
            type: categoryData.type,
            status: categoryData.status,
            dispense_method: categoryData.dispense_method,
            service_charge_type: categoryData.service_charge_type,
            service_charge_amount:
                categoryData.service_charge_amount && categoryData.service_charge_amount !== ''
                    ? parseFloat(categoryData.service_charge_amount.toString())
                    : null,
            percentage_caped_amount:
                categoryData.percentage_caped_amount && categoryData.percentage_caped_amount !== ''
                    ? parseFloat(categoryData.percentage_caped_amount.toString())
                    : null,
            gateway_id:
                categoryData.gateway_id && categoryData.gateway_id !== ''
                    ? parseInt(categoryData.gateway_id, 10)
                    : null,
        };

        router.put(route('admin.data-plan-categories.update', categoryToEdit.id), submitData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Category updated');
                setCategoryEditModalOpen(false);
                setCategoryToEdit(null);
                resetCategory();
            },
            onError: () => toast.error('Failed to update category'),
        });
    };

    const toggleNetworkStatus = (network: Network) => {
        const newStatus = network.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        router.patch(
            route('admin.networks.update-status', network.id),
            { status: newStatus },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success(`${network.name} ${newStatus.toLowerCase()}`),
                onError: () => toast.error('Failed to update status'),
            },
        );
    };

    const toggleCategoryStatus = (category: DataPlanCategory) => {
        const newStatus = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        router.patch(
            route('admin.data-plan-categories.update-status', category.id),
            { status: newStatus },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success(`${category.name} ${newStatus.toLowerCase()}`),
                onError: () => toast.error('Failed to update status'),
            },
        );
    };

    const toggleChannel = (category: DataPlanCategory, channel: string) => {
        router.patch(
            route('admin.data-plan-categories.toggle-channel', category.id),
            { channel },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['dataPlanCategories'] });
                },
                onError: () => toast.error('Failed to toggle channel'),
            },
        );
    };

    const setActiveChannel = (category: DataPlanCategory, channel: string | null) => {
        router.patch(
            route('admin.data-plan-categories.set-active-channel', category.id),
            { channel },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['dataPlanCategories'] });
                },
                onError: () => toast.error('Failed to set active channel'),
            },
        );
    };

    const isChannelEnabled = (category: DataPlanCategory, channel: string) => {
        return category.enabled_channels?.[channel] ?? false;
    };

    const formatChannelName = (channel: string) => {
        const names: Record<string, string> = {
            WALLET: 'Wallet',
            SIM: 'SIM',
            SMARTCASH_WALLET: 'Smartcash Wallet',
            SMARTCASH_AIRTIME: 'Smartcash Airtime',
            MOMO: 'Momo',
        };
        return names[channel] || channel;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuration" />

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Sidebar */}
                <div className="border-border/50 w-48 flex-shrink-0 border-r">
                    <div className="p-3">
                        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
                            <Settings className="h-4 w-4" />
                            Networks
                        </h2>
                        <nav className="space-y-1">
                            {networks.map((network) => (
                                <button
                                    key={network.id}
                                    onClick={() => handleNetworkSelect(network.id)}
                                    className={cn(
                                        'flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors',
                                        activeNetwork === network.id
                                            ? 'bg-accent text-foreground font-medium'
                                            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                                    )}
                                >
                                    <span>{network.name}</span>
                                    <span className={cn('h-2 w-2 rounded-full', network.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300')} />
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl flex-1 overflow-y-auto p-6">
                    {selectedNetwork && (
                        <div className="space-y-6">
                            {/* Network Settings */}
                            <Card className="bg-accent/40 rounded-none py-0">
                                <CardHeader className="py-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-medium">{selectedNetwork.name}</CardTitle>
                                            <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                    <Switch
                                                    id={`network-status-${selectedNetwork.id}`}
                                                    checked={selectedNetwork.status === 'ACTIVE'}
                                                    onCheckedChange={() => toggleNetworkStatus(selectedNetwork)}
                                                    />
                                                <Label htmlFor={`network-status-${selectedNetwork.id}`} className="text-xs text-gray-500">
                                                    {selectedNetwork.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                </Label>
                                                </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(selectedNetwork)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                </CardHeader>
                                {selectedNetwork.description && (
                                    <CardContent className="pt-0">
                                        <p className="text-xs text-gray-500">{selectedNetwork.description}</p>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Categories */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-500">Categories & Channels</h3>
                                    <Link
                                        href={route('admin.gateways.index')}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Gateways <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </div>

                                {networkCategories.length === 0 ? (
                                    <p className="text-sm text-gray-400">No categories for this network</p>
                                ) : (
                                    <div className="space-y-3">
                                                {networkCategories.map((category) => (
                                            <Card key={category.id} className="border-border/50 rounded-none py-0">
                                                <CardContent className="p-0">
                                                    {/* Category Header */}
                                                    <div className="bg-accent/40 mb-2 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 p-3">
                                                            <span className="text-sm font-medium">{category.name}</span>
                                                            {category.gateway && (
                                                                <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                                                    {category.gateway.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    id={`cat-status-${category.id}`}
                                                                    checked={category.status === 'ACTIVE'}
                                                                    onCheckedChange={() => toggleCategoryStatus(category)}
                                                                />
                                                                <Label htmlFor={`cat-status-${category.id}`} className="text-xs text-gray-500">
                                                                    {category.status === 'ACTIVE' ? 'On' : 'Off'}
                                                                </Label>
                                                            </div>
                                                            <Button variant="ghost" size="sm" onClick={() => handleCategoryEditClick(category)}>
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Channel Settings */}
                                                    <div className="space-y-1 p-3">
                                                        <div className="mb-2">
                                                            <span className="text-xs font-medium text-gray-500">Dispense Channels</span>
                                            </div>
                                                        <div className="space-y-1">
                                                            {channels.map((channel) => {
                                                                const enabled = isChannelEnabled(category, channel);
                                                                const isActive = category.active_channel === channel;
                                                                return (
                                                                    <div
                                                                        key={channel}
                                                                        className={cn(
                                                                            'flex items-center px-2 py-1.5 text-sm transition-colors',
                                                                            isActive && 'bg-accent/50',
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Switch
                                                                                id={`ch-${category.id}-${channel}`}
                                                                                checked={enabled}
                                                                                onCheckedChange={() => toggleChannel(category, channel)}
                                                                                className="scale-75"
                                                                            />
                                                                            <Label
                                                                                htmlFor={`ch-${category.id}-${channel}`}
                                                                                className={cn(
                                                                                    'cursor-pointer text-xs',
                                                                                    enabled ? 'text-foreground' : 'text-gray-400',
                                                                                )}
                                                                            >
                                                                                {formatChannelName(channel)}
                                                                            </Label>
                                                                        </div>
                                    </div>
                                );
                            })}
                                                        </div>
                                                        {/* Active Channel Select */}
                                                        <div className="mt-3 space-y-1">
                                                            <Label className="text-xs text-gray-500">Active Channel</Label>
                                                            <Select
                                                                value={category.active_channel || 'none'}
                                                                onValueChange={(value) => setActiveChannel(category, value === 'none' ? null : value)}
                                                            >
                                                                <SelectTrigger className="h-8 text-xs">
                                                                    <SelectValue placeholder="Select active channel" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">None</SelectItem>
                                                                    {channels
                                                                        .filter((channel) => isChannelEnabled(category, channel))
                                                                        .map((channel) => (
                                                                            <SelectItem key={channel} value={channel}>
                                                                                {formatChannelName(channel)}
                                                                            </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                        </div>
                    </CardContent>
                </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Network Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base">Edit {networkToEdit?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <Label className="text-xs">Name</Label>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} className="h-8 text-sm" />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <Label className="text-xs">Description</Label>
                            <Input value={data.description} onChange={(e) => setData('description', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div>
                            <Label className="text-xs">API ID</Label>
                            <Input value={data.api_id} onChange={(e) => setData('api_id', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div>
                            <Label className="text-xs">Status</Label>
                            <Select value={data.status} onValueChange={(value: 'ACTIVE' | 'INACTIVE') => setData('status', value)}>
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setEditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={processing}>
                                Save
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Category Modal */}
            <Dialog open={categoryEditModalOpen} onOpenChange={setCategoryEditModalOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base">Edit {categoryToEdit?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCategorySubmit} className="space-y-3">
                        <div>
                            <Label className="text-xs">Name</Label>
                            <Input value={categoryData.name} onChange={(e) => setCategoryData('name', e.target.value)} className="h-8 text-sm" />
                            {categoryErrors.name && <p className="text-xs text-red-500">{categoryErrors.name}</p>}
                        </div>
                        <div>
                            <Label className="text-xs">Description</Label>
                            <Input
                                value={categoryData.description}
                                onChange={(e) => setCategoryData('description', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Type</Label>
                            <Select
                                value={categoryData.type}
                                onValueChange={(value: 'DIRECT_GIFTING' | 'DATA_SHARE' | 'AWOOF') => setCategoryData('type', value)}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DIRECT_GIFTING">Direct Gifting</SelectItem>
                                    <SelectItem value="DATA_SHARE">Data Share</SelectItem>
                                    <SelectItem value="AWOOF">Awoof</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Status</Label>
                            <Select value={categoryData.status} onValueChange={(value: 'ACTIVE' | 'INACTIVE') => setCategoryData('status', value)}>
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-xs">Gateway</Label>
                            <Select
                                value={categoryData.gateway_id || 'none'}
                                onValueChange={(value) => setCategoryData('gateway_id', value === 'none' ? '' : value)}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Select gateway" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {gateways.map((g) => (
                                        <SelectItem key={g.id} value={g.id.toString()}>
                                            {g.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {categoryErrors.gateway_id && (
                                <p className="text-xs text-red-500">{categoryErrors.gateway_id}</p>
                            )}
                        </div>

                        {/* Service Charge Settings */}
                        <div className="space-y-2 border-t pt-3">
                            <Label className="text-xs font-medium">Service Charge</Label>
                            <div>
                                <Label className="text-xs text-gray-500">Charge Type</Label>
                                <Select
                                    value={categoryData.service_charge_type}
                                    onValueChange={(value: 'percentage' | 'amount' | 'default') => {
                                        setCategoryData('service_charge_type', value);
                                        if (value === 'default') {
                                            setCategoryData('service_charge_amount', '');
                                            setCategoryData('percentage_caped_amount', '');
                                        }
                                    }}
                                >
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default (Use Category)</SelectItem>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="amount">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {categoryData.service_charge_type !== 'default' && (
                                <>
                                    <div>
                                        <Label className="text-xs text-gray-500">
                                            {categoryData.service_charge_type === 'percentage' ? 'Percentage (%)' : 'Amount (₦)'}
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={categoryData.service_charge_amount || ''}
                                            onChange={(e) => setCategoryData('service_charge_amount', e.target.value || null)}
                                            placeholder={categoryData.service_charge_type === 'percentage' ? 'e.g. 5.5' : 'e.g. 100'}
                                            className="h-8 text-sm"
                                        />
                                        {categoryErrors.service_charge_amount && (
                                            <p className="text-xs text-red-500">{categoryErrors.service_charge_amount}</p>
                                        )}
                                    </div>

                                    {categoryData.service_charge_type === 'percentage' && (
                                        <div>
                                            <Label className="text-xs text-gray-500">Cap Amount (₦)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={categoryData.percentage_caped_amount || ''}
                                                onChange={(e) => setCategoryData('percentage_caped_amount', e.target.value || null)}
                                                placeholder="e.g. 1000"
                                                className="h-8 text-sm"
                                            />
                                            {categoryErrors.percentage_caped_amount && (
                                                <p className="text-xs text-red-500">{categoryErrors.percentage_caped_amount}</p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setCategoryEditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={categoryProcessing}>
                                Save
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
