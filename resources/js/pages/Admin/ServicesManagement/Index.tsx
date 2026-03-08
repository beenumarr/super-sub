import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CreditCard, Globe2, Layers3, Lightbulb, Network, Tv, Wallet, Workflow } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface MobileNetwork {
    id: number;
    name: string;
    data_active: boolean;
    airtime_active: boolean;
    api_network_id?: string | null;
    airtime_transaction_api_id?: number | null;
}

interface ApiDefinition {
    id: number;
    name: string;
    model: string;
}

interface ServicesManagementProps {
    mobile_networks: MobileNetwork[];
    apis: ApiDefinition[];
    isStl?: boolean;
    can_add_api?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Services Management', href: '/admin/services-management' },
];

function getNetworkIcon(name: string) {
    const key = name.toLowerCase();

    // Prefer branded icons if available in /images/icons
    return `/images/icons/${key}.png`;
}

function getApiType(model: string): string {
    // Mimic old behavior: strip namespace and trailing backslashes
    const raw = model.replace(/^.*APIs\\/, '').replace(/\\$/, '');
    return raw === 'Default' ? 'Msorg' : raw;
}

export default function ServicesManagement({ mobile_networks, apis, isStl, can_add_api }: ServicesManagementProps) {
    const [networkDialogOpen, setNetworkDialogOpen] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState<MobileNetwork | null>(null);

    const [utilityDialogOpen, setUtilityDialogOpen] = useState(false);
    const [utilityServiceKey, setUtilityServiceKey] = useState<
        | 'cable_tv_services'
        | 'result_checker_services'
        | 'airtime_to_cash_services'
        | 'bill_payment_services'
        | 'wallet_funding_services'
        | 'user_packages'
        | null
    >(null);

    const [apiDialogOpen, setApiDialogOpen] = useState(false);
    const [apiCreateDialogOpen, setApiCreateDialogOpen] = useState(false);
    const [selectedApi, setSelectedApi] = useState<ApiDefinition | null>(null);

    const handleOpenNetworkDialog = (network: MobileNetwork) => {
        setSelectedNetwork(network);
        setNetworkDialogOpen(true);
    };

    const handleOpenUtilityDialog = (
        key:
            | 'cable_tv_services'
            | 'result_checker_services'
            | 'airtime_to_cash_services'
            | 'bill_payment_services'
            | 'wallet_funding_services'
            | 'user_packages',
    ) => {
        setUtilityServiceKey(key);
        setUtilityDialogOpen(true);
    };

    const handleOpenApiDialog = (api: ApiDefinition) => {
        setSelectedApi(api);
        setApiDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services Management" />

            <div className="px-4 py-8 lg:px-0">
                <div className="mx-auto flex max-w-6xl flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Services Management</h1>
                            <p className="mt-1 text-sm text-gray-500">Configure data, airtime, utility services and vending APIs.</p>
                        </div>
                    </div>

                    {/* Data & Airtime Services */}
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardHeader className="border-b bg-gray-50 py-3 dark:border-gray-800 dark:bg-gray-900/40">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Network className="text-theme-1 h-4 w-4" />
                                <span>Data and Airtime Services</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5">
                            {mobile_networks.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No networks configured yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {mobile_networks.map((network) => {
                                        const iconSrc = getNetworkIcon(network.name);

                                        return (
                                            <div
                                                key={network.id}
                                                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900"
                                            >
                                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                                    <img
                                                        src={iconSrc}
                                                        alt={network.name}
                                                        className="h-10 w-10 rounded-full object-contain"
                                                        onError={(e) => {
                                                            // Fallback: hide broken image and show initials
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-1 flex-col gap-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-gray-900 dark:text-white">{network.name}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
                                                        <span>
                                                            Data:{' '}
                                                            <span
                                                                className={
                                                                    network.data_active
                                                                        ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                                                                        : 'font-semibold text-red-500'
                                                                }
                                                            >
                                                                {network.data_active ? 'Active' : 'Disabled'}
                                                            </span>
                                                        </span>
                                                        <span>
                                                            Airtime:{' '}
                                                            <span
                                                                className={
                                                                    network.airtime_active
                                                                        ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                                                                        : 'font-semibold text-red-500'
                                                                }
                                                            >
                                                                {network.airtime_active ? 'Active' : 'Disabled'}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-auto">
                                                    <Button size="sm" variant="outline" onClick={() => handleOpenNetworkDialog(network)}>
                                                        Manage
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Utility & Other Services */}
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                        <CardHeader className="border-b bg-gray-50 py-3 dark:border-gray-800 dark:bg-gray-900/40">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Layers3 className="text-theme-1 h-4 w-4" />
                                <span>Utility and Other Services</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <ServiceLink name="Cable TV Subscriptions" icon={Tv} onClick={() => handleOpenUtilityDialog('cable_tv_services')} />
                                <ServiceLink
                                    name="Result Checker"
                                    icon={CreditCard}
                                    onClick={() => handleOpenUtilityDialog('result_checker_services')}
                                />
                                <ServiceLink
                                    name="Airtime to Cash"
                                    icon={Workflow}
                                    onClick={() => handleOpenUtilityDialog('airtime_to_cash_services')}
                                />
                                <ServiceLink
                                    name="Electricity Bill Payments"
                                    icon={Lightbulb}
                                    onClick={() => handleOpenUtilityDialog('bill_payment_services')}
                                />
                                <ServiceLink name="Wallet Funding" icon={Wallet} onClick={() => handleOpenUtilityDialog('wallet_funding_services')} />
                                <ServiceLink name="User Spending Limit" icon={Wallet} onClick={() => handleOpenUtilityDialog('user_packages')} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vending Medium APIs */}
                    {isStl && (
                        <Card className="border border-gray-200 shadow-sm dark:border-gray-800">
                            <CardHeader className="flex items-center justify-between border-b bg-gray-50 py-3 dark:border-gray-800 dark:bg-gray-900/40">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Globe2 className="text-theme-1 h-4 w-4" />
                                    <span>Vending Medium APIs</span>
                                </CardTitle>
                                {can_add_api && (
                                    <Button size="sm" onClick={() => setApiCreateDialogOpen(true)}>
                                        Add API
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 sm:p-5">
                                {apis.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No APIs configured yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {apis.map((api) => (
                                            <div
                                                key={api.id}
                                                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-900"
                                            >
                                                <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                                                    <Globe2 className="text-theme-1 h-6 w-6" />
                                                </div>
                                                <div className="flex flex-1 flex-col gap-1">
                                                    <span className="font-medium text-gray-900 dark:text-white">{api.name}</span>
                                                    <span className="text-xs text-gray-600 dark:text-gray-300">
                                                        API Type: <span className="font-semibold">{getApiType(api.model)}</span>
                                                    </span>
                                                </div>
                                                <div className="ml-auto">
                                                    <Button size="sm" variant="outline" onClick={() => handleOpenApiDialog(api)}>
                                                        Manage
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Network configuration modal */}
            <NetworkConfigDialog open={networkDialogOpen} onOpenChange={setNetworkDialogOpen} network={selectedNetwork} apis={apis} />

            {/* Utility services modal (high-level, links to legacy detail pages) */}
            <UtilityServiceDialog
                open={utilityDialogOpen}
                onOpenChange={setUtilityDialogOpen}
                serviceKey={utilityServiceKey}
                apis={apis}
                isStl={isStl ?? false}
            />

            {/* API edit / create modals */}
            <ApiConfigDialog open={apiDialogOpen} onOpenChange={setApiDialogOpen} api={selectedApi} />
            <ApiCreateDialog open={apiCreateDialogOpen} onOpenChange={setApiCreateDialogOpen} />
        </AppLayout>
    );
}

interface ServiceLinkProps {
    name: string;
    icon: typeof Tv;
    onClick: () => void;
}

function ServiceLink({ name, icon: Icon, onClick }: ServiceLinkProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="hover:border-theme-1/40 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left text-sm shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                <Icon className="text-theme-1 h-6 w-6" />
            </div>
            <div className="flex flex-1 flex-col">
                <span className="font-medium text-gray-900 dark:text-white">{name}</span>
            </div>
            <span className="text-theme-1 text-xs font-medium">Configure</span>
        </button>
    );
}

interface NetworkConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    network: MobileNetwork | null;
    apis: ApiDefinition[];
}

function NetworkConfigDialog({ open, onOpenChange, network, apis }: NetworkConfigDialogProps) {
    const { data, setData, put, processing, reset } = useForm<{
        api_network_id: string;
        airtime_transaction_api_id: string;
        data_active: boolean;
        airtime_active: boolean;
    }>({
        api_network_id: '',
        airtime_transaction_api_id: '',
        data_active: false,
        airtime_active: false,
    });

    useEffect(() => {
        if (network) {
            setData({
                api_network_id: network.api_network_id ?? '',
                airtime_transaction_api_id: network.airtime_transaction_api_id ? String(network.airtime_transaction_api_id) : '',
                data_active: !!network.data_active,
                airtime_active: !!network.airtime_active,
            });
        }
    }, [network, setData]);

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    if (!network) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            route('mobile_networks.update', {
                mobile_network: network.id,
            }),
            {
                onSuccess: () => {
                    toast.success('Network settings updated');
                    handleClose();
                },
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    if (first) {
                        toast.error(String(first));
                    }
                },
                preserveScroll: true,
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Data and Airtime Services – {network.name}</DialogTitle>
                    <DialogDescription>Configure API bindings and enable or disable data and airtime services for this network.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="api_network_id">API ID</Label>
                            <Input
                                id="api_network_id"
                                name="api_network_id"
                                value={data.api_network_id}
                                onChange={(e) => setData('api_network_id', e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="airtime_transaction_api_id">Airtime API (optional)</Label>
                            <Select
                                value={data.airtime_transaction_api_id || 'none'}
                                onValueChange={(value) => setData('airtime_transaction_api_id', value === 'none' ? '' : value)}
                            >
                                <SelectTrigger id="airtime_transaction_api_id">
                                    <SelectValue placeholder="Select API" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {apis.map((api) => (
                                        <SelectItem key={api.id} value={String(api.id)}>
                                            {api.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/40">
                            <div className="space-y-0.5">
                                <Label>Data service</Label>
                                <p className="text-xs text-gray-500">Enable or disable data vending for this network.</p>
                            </div>
                            <Switch checked={data.data_active} onCheckedChange={(checked) => setData('data_active', checked)} />
                        </div>

                        <div className="flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/40">
                            <div className="space-y-0.5">
                                <Label>Airtime service</Label>
                                <p className="text-xs text-gray-500">Enable or disable airtime vending for this network.</p>
                            </div>
                            <Switch checked={data.airtime_active} onCheckedChange={(checked) => setData('airtime_active', checked)} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type UtilityServiceKey =
    | 'cable_tv_services'
    | 'result_checker_services'
    | 'airtime_to_cash_services'
    | 'bill_payment_services'
    | 'wallet_funding_services'
    | 'user_packages';

interface UtilityServiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    serviceKey: UtilityServiceKey | null;
    apis: ApiDefinition[];
    isStl: boolean;
}

function UtilityServiceDialog({ open, onOpenChange, serviceKey, apis, isStl }: UtilityServiceDialogProps) {
    if (!serviceKey) return null;

    if (serviceKey === 'wallet_funding_services') {
        return <WalletFundingDialog open={open} onOpenChange={onOpenChange} />;
    }

    if (serviceKey === 'user_packages') {
        return <UserPackagesDialog open={open} onOpenChange={onOpenChange} />;
    }

    if (serviceKey === 'cable_tv_services') {
        return <CableTvDialog open={open} onOpenChange={onOpenChange} apis={apis} isStl={isStl} />;
    }

    if (serviceKey === 'result_checker_services') {
        return <ResultCheckerDialog open={open} onOpenChange={onOpenChange} apis={apis} isStl={isStl} />;
    }

    if (serviceKey === 'airtime_to_cash_services') {
        return <AirtimeToCashDialog open={open} onOpenChange={onOpenChange} apis={apis} isStl={isStl} />;
    }

    if (serviceKey === 'bill_payment_services') {
        return <BillPaymentDialog open={open} onOpenChange={onOpenChange} apis={apis} isStl={isStl} />;
    }

    return null;
}

interface WalletFundingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function WalletFundingDialog({ open, onOpenChange }: WalletFundingDialogProps) {
    const { data, setData, put, processing, reset } = useForm<{ services: { name: string; active: boolean | number }[] }>({
        services: [],
    });

    useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                const response = await fetch('/admin/wallet_funding_services');
                const json = await response.json();
                setData('services', json);
            } catch (error) {
                toast.error('Failed to load wallet funding settings');
            }
        })();
    }, [open, setData]);

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    const handleToggle = (name: string, checked: boolean) => {
        setData(
            'services',
            data.services.map((service) => (service.name === name ? { ...service, active: checked ? 1 : 0 } : service)),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            route('wallet_funding_services.update', {
                wallet_funding_service: 1,
            }),
            {
                onSuccess: () => {
                    toast.success('Wallet funding settings updated');
                    handleClose();
                },
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    if (first) {
                        toast.error(String(first));
                    }
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Wallet Funding Services</DialogTitle>
                    <DialogDescription>Enable or disable wallet funding methods.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        {data.services.map((service) => (
                            <div
                                key={service.name}
                                className="flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900/40"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{service.active ? 'Active' : 'Disabled'}</span>
                                    <Switch checked={!!service.active} onCheckedChange={(checked) => handleToggle(service.name, checked)} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface UserPackagesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function UserPackagesDialog({ open, onOpenChange }: UserPackagesDialogProps) {
    const { data, setData, put, processing, reset } = useForm<{
        user_packages: { name: string; daily_spending_limit: number | string }[];
    }>({
        user_packages: [],
    });

    useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                const response = await fetch('/admin/user_packages');
                const json = await response.json();
                setData('user_packages', json);
            } catch (error) {
                toast.error('Failed to load user package settings');
            }
        })();
    }, [open, setData]);

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    const handleLimitChange = (name: string, value: string) => {
        setData(
            'user_packages',
            data.user_packages.map((pkg) => (pkg.name === name ? { ...pkg, daily_spending_limit: value } : pkg)),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            route('user_packages.update', {
                id: 1,
            }),
            {
                onSuccess: () => {
                    toast.success('User spending limits updated');
                    handleClose();
                },
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    if (first) {
                        toast.error(String(first));
                    }
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>User Spending Limits</DialogTitle>
                    <DialogDescription>Configure daily spending limits for each user package.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        {data.user_packages.map((pkg) => (
                            <div key={pkg.name} className="rounded-md border bg-gray-50 px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900/40">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">{pkg.name}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor={`limit-${pkg.name}`}>Daily limit (NGN)</Label>
                                    <Input
                                        id={`limit-${pkg.name}`}
                                        type="number"
                                        min={0}
                                        value={pkg.daily_spending_limit ?? ''}
                                        onChange={(e) => handleLimitChange(pkg.name, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface CableTvDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    apis: ApiDefinition[];
    isStl: boolean;
}

function CableTvDialog({ open, onOpenChange, apis, isStl }: CableTvDialogProps) {
    const { data, setData, put, processing, reset } = useForm<{
        services: {
            name: string;
            code: string;
            active: number | boolean;
            transaction_api_id?: number | string | null;
        }[];
    }>({
        services: [],
    });

    useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                const response = await fetch('/admin/cable_tv_services');
                const json = await response.json();
                setData('services', json);
            } catch (error) {
                toast.error('Failed to load cable TV services');
            }
        })();
    }, [open, setData]);

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    const updateService = (name: string, updater: (svc: any) => any) => {
        setData(
            'services',
            data.services.map((svc) => (svc.name === name ? updater(svc) : svc)),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            route('cable_tv_services.update', {
                cable_tv_service: 1,
            }),
            {
                onSuccess: () => {
                    toast.success('Cable TV settings updated');
                    handleClose();
                },
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    if (first) toast.error(String(first));
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Cable TV Services</DialogTitle>
                    <DialogDescription>Configure provider codes, vending APIs, and enable or disable each service.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        {data.services.map((service) => (
                            <div key={service.name} className="rounded-md border bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/40">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{service.active ? 'Active' : 'Disabled'}</span>
                                        <Switch
                                            checked={!!service.active}
                                            onCheckedChange={(checked) =>
                                                updateService(service.name, (svc) => ({
                                                    ...svc,
                                                    active: checked ? 1 : 0,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label>API ID</Label>
                                        <Input
                                            value={service.code ?? ''}
                                            onChange={(e) =>
                                                updateService(service.name, (svc) => ({
                                                    ...svc,
                                                    code: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    {isStl && (
                                        <div className="space-y-1.5">
                                            <Label>Vending Medium API</Label>
                                            <Select
                                                value={service.transaction_api_id ? String(service.transaction_api_id) : 'none'}
                                                onValueChange={(value) =>
                                                    updateService(service.name, (svc) => ({
                                                        ...svc,
                                                        transaction_api_id: value === 'none' ? null : Number(value),
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select API" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {apis.map((api) => (
                                                        <SelectItem key={api.id} value={String(api.id)}>
                                                            {api.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface ResultCheckerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    apis: ApiDefinition[];
    isStl: boolean;
}

function ResultCheckerDialog({ open, onOpenChange, apis, isStl }: ResultCheckerDialogProps) {
    const { data, setData, put, processing, reset } = useForm<{
        services: {
            name: string;
            api_id: string;
            amount: string | number;
            active: number | boolean;
            transaction_api_id?: number | string | null;
        }[];
    }>({
        services: [],
    });

    useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                const response = await fetch('/admin/result_checker_services');
                const json = await response.json();
                setData('services', json);
            } catch (error) {
                toast.error('Failed to load result checker services');
            }
        })();
    }, [open, setData]);

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    const updateService = (name: string, updater: (svc: any) => any) => {
        setData(
            'services',
            data.services.map((svc) => (svc.name === name ? updater(svc) : svc)),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            route('result_checker_services.update', {
                result_checker_service: 1,
            }),
            {
                onSuccess: () => {
                    toast.success('Result checker settings updated');
                    handleClose();
                },
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    if (first) toast.error(String(first));
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Result Checker Services</DialogTitle>
                    <DialogDescription>Configure API IDs, prices, and vending APIs for each exam type.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        {data.services.map((service) => (
                            <div key={service.name} className="rounded-md border bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/40">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{service.active ? 'Active' : 'Disabled'}</span>
                                        <Switch
                                            checked={!!service.active}
                                            onCheckedChange={(checked) =>
                                                updateService(service.name, (svc) => ({
                                                    ...svc,
                                                    active: checked ? 1 : 0,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label>API ID</Label>
                                        <Input
                                            value={service.api_id ?? ''}
                                            onChange={(e) =>
                                                updateService(service.name, (svc) => ({
                                                    ...svc,
                                                    api_id: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Price (NGN)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={service.amount ?? ''}
                                            onChange={(e) =>
                                                updateService(service.name, (svc) => ({
                                                    ...svc,
                                                    amount: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    {isStl && (
                                        <div className="space-y-1.5">
                                            <Label>Vending Medium API</Label>
                                            <Select
                                                value={service.transaction_api_id ? String(service.transaction_api_id) : 'none'}
                                                onValueChange={(value) =>
                                                    updateService(service.name, (svc) => ({
                                                        ...svc,
                                                        transaction_api_id: value === 'none' ? null : Number(value),
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select API" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {apis.map((api) => (
                                                        <SelectItem key={api.id} value={String(api.id)}>
                                                            {api.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface AirtimeToCashDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    apis: ApiDefinition[];
    isStl: boolean;
}

function AirtimeToCashDialog({ open, onOpenChange, apis, isStl }: AirtimeToCashDialogProps) {
    const { data, setData, put, processing, reset } = useForm<{
        services: {
            name: string;
            airtime_to_cash_active: number | boolean;
            airtime_to_cash_limit: string | number | null;
            airtime_to_cash_api_id?: number | string | null;
        }[];
    }>({
        services: [],
    });

    useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                const response = await fetch('/admin/airtime_to_cash_services');
                const json = await response.json();
                setData('services', json);
            } catch (error) {
                toast.error('Failed to load airtime to cash services');
            }
        })();
    }, [open, setData]);

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    const updateService = (name: string, updater: (svc: any) => any) => {
        setData(
            'services',
            data.services.map((svc) => (svc.name === name ? updater(svc) : svc)),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            route('airtime_to_cash_services.update', {
                airtime_to_cash_service: 1,
            }),
            {
                onSuccess: () => {
                    toast.success('Airtime to cash settings updated');
                    handleClose();
                },
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    if (first) toast.error(String(first));
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Airtime to Cash</DialogTitle>
                    <DialogDescription>Configure limits, vending APIs, and enable or disable each network.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        {data.services.map((service) => (
                            <div key={service.name} className="rounded-md border bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/40">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{service.airtime_to_cash_active ? 'Active' : 'Disabled'}</span>
                                        <Switch
                                            checked={!!service.airtime_to_cash_active}
                                            onCheckedChange={(checked) =>
                                                updateService(service.name, (svc) => ({
                                                    ...svc,
                                                    airtime_to_cash_active: checked ? 1 : 0,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label>Limit (NGN)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={service.airtime_to_cash_limit ?? ''}
                                            onChange={(e) =>
                                                updateService(service.name, (svc) => ({
                                                    ...svc,
                                                    airtime_to_cash_limit: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    {isStl && (
                                        <div className="space-y-1.5">
                                            <Label>Vending Medium API</Label>
                                            <Select
                                                value={service.airtime_to_cash_api_id ? String(service.airtime_to_cash_api_id) : 'none'}
                                                onValueChange={(value) =>
                                                    updateService(service.name, (svc) => ({
                                                        ...svc,
                                                        airtime_to_cash_api_id: value === 'none' ? null : Number(value),
                                                    }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select API" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {apis.map((api) => (
                                                        <SelectItem key={api.id} value={String(api.id)}>
                                                            {api.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface BillPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    apis: ApiDefinition[];
    isStl: boolean;
}

function BillPaymentDialog({ open, onOpenChange, apis, isStl }: BillPaymentDialogProps) {
    const { data, setData, put, processing, reset } = useForm<{
        services: {
            name: string;
            api_id: string;
            code: string;
            active: number | boolean;
        }[];
        electricicty_bill_transaction_api_id?: number | string | null;
    }>({
        services: [],
        electricicty_bill_transaction_api_id: null,
    });

    useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                const response = await fetch('/admin/bill_payment_services');
                const json = await response.json();
                setData({
                    services: json.services ?? [],
                    electricicty_bill_transaction_api_id: json.electricicty_bill_transaction_api_id ?? null,
                });
            } catch (error) {
                toast.error('Failed to load bill payment services');
            }
        })();
    }, [open, setData]);

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    const updateService = (name: string, updater: (svc: any) => any) => {
        setData(
            'services',
            data.services.map((svc) => (svc.name === name ? updater(svc) : svc)),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            route('bill_payment_services.update', {
                bill_payment_service: 1,
            }),
            {
                onSuccess: () => {
                    toast.success('Bill payment settings updated');
                    handleClose();
                },
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    if (first) toast.error(String(first));
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Electricity Bill Payments</DialogTitle>
                    <DialogDescription>Configure distributors, API IDs, and vending API for bill payments.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isStl && (
                        <div className="space-y-1.5">
                            <Label>Global Vending Medium API</Label>
                            <Select
                                value={data.electricicty_bill_transaction_api_id ? String(data.electricicty_bill_transaction_api_id) : 'none'}
                                onValueChange={(value) => setData('electricicty_bill_transaction_api_id', value === 'none' ? null : Number(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select API" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {apis.map((api) => (
                                        <SelectItem key={api.id} value={String(api.id)}>
                                            {api.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-4">
                        {data.services.map((service) => (
                            <div key={service.name} className="rounded-md border bg-gray-50 p-3 text-sm dark:border-gray-800 dark:bg-gray-900/40">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{service.active ? 'Active' : 'Disabled'}</span>
                                        <Switch
                                            checked={!!service.active}
                                            onCheckedChange={(checked) =>
                                                updateService(service.name, (svc) => ({
                                                    ...svc,
                                                    active: checked ? 1 : 0,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label>API ID</Label>
                                        <Input
                                            value={service.api_id ?? ''}
                                            onChange={(e) =>
                                                updateService(service.name, (svc) => ({
                                                    ...svc,
                                                    api_id: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>API Cable Name / Code</Label>
                                        <Input
                                            value={service.code ?? ''}
                                            onChange={(e) =>
                                                updateService(service.name, (svc) => ({
                                                    ...svc,
                                                    code: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface ApiConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    api: ApiDefinition | null;
}

function ApiConfigDialog({ open, onOpenChange, api }: ApiConfigDialogProps) {
    const { data, setData, put, processing, reset } = useForm({
        name: '',
        url: '',
        token: '',
    });

    useEffect(() => {
        if (api) {
            setData({
                name: api.name,
                url: '',
                token: '',
            });
        }
    }, [api, setData]);

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    if (!api) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(
            route('transaction_apis.update', {
                transaction_api: api.id,
            }),
            {
                onSuccess: () => {
                    toast.success('API configuration updated');
                    handleClose();
                },
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    if (first) {
                        toast.error(String(first));
                    }
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Vending Medium API – {api.name}</DialogTitle>
                    <DialogDescription>Update connection details for this vending API integration.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="api-name">API name</Label>
                        <Input id="api-name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="api-url">API URL</Label>
                        <Input id="api-url" value={data.url} onChange={(e) => setData('url', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="api-token">API Token / Key (optional)</Label>
                        <Input id="api-token" value={data.token} onChange={(e) => setData('token', e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface ApiCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function ApiCreateDialog({ open, onOpenChange }: ApiCreateDialogProps) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        url: '',
        token: '',
    });

    const handleClose = () => {
        onOpenChange(false);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('transaction_apis.store'), {
            onSuccess: () => {
                toast.success('API registered successfully');
                handleClose();
            },
            onError: (errors) => {
                const first = Object.values(errors)[0];
                if (first) {
                    toast.error(String(first));
                }
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Vending Medium API</DialogTitle>
                    <DialogDescription>Register a new external API provider for vending services.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="new-api-name">API name</Label>
                        <Input id="new-api-name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-api-url">API URL</Label>
                        <Input id="new-api-url" value={data.url} onChange={(e) => setData('url', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-api-token">API Token / Key (optional)</Label>
                        <Input id="new-api-token" value={data.token} onChange={(e) => setData('token', e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create API
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
