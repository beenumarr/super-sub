import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Plus, PowerOff, Server, Settings, Smartphone, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Network {
    id: number;
    name: string;
}

interface PhoneNumber {
    id: number;
    number: string;
    network: {
        name: string;
    };
}

interface DataPlan {
    id: number;
    name: string;
}

interface DataPlanCategory {
    id: number;
    name: string;
    description: string | null;
    network_id: number;
    phone_number_id: number | null;
    dispense_method: 'CLOUD' | 'DEVICE' | 'WALLET';
    status: 'ACTIVE' | 'INACTIVE';
    type: string;
    network: Network;
    phoneNumber: PhoneNumber | null;
    dataPlans: DataPlan[];
}

interface DataPlanCategoriesProps {
    categories: Record<string, DataPlanCategory[]>;
    networks: Network[];
    phoneNumbers: PhoneNumber[];
    dispenseMethodOptions: Record<string, string>;
}

export default function DataPlanCategories({ categories, networks, phoneNumbers, dispenseMethodOptions }: DataPlanCategoriesProps) {
    const [editingCategory, setEditingCategory] = useState<DataPlanCategory | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState(Object.keys(categories)[0] || 'general');

    // Form for editing an existing category
    const editForm = useForm({
        name: '',
        description: '',
        network_id: '',
        phone_number_id: '',
        dispense_method: 'CLOUD',
        status: 'ACTIVE',
        type: '',
    });

    // Form for creating a new category
    const createForm = useForm({
        name: '',
        description: '',
        network_id: '',
        phone_number_id: '',
        dispense_method: 'CLOUD',
        status: 'ACTIVE',
        type: activeTab,
    });

    // Start editing a category
    const handleEdit = (category: DataPlanCategory) => {
        setEditingCategory(category);
        editForm.setData({
            name: category.name,
            description: category.description || '',
            network_id: category.network_id.toString(),
            phone_number_id: category.phone_number_id ? category.phone_number_id.toString() : '',
            dispense_method: category.dispense_method,
            status: category.status,
            type: category.type,
        });
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingCategory(null);
        editForm.reset();
    };

    // Toggle category status
    const toggleStatus = (category: DataPlanCategory) => {
        const newStatus = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        // Use router directly instead of useForm in a function
        router.put(
            route('settings.data-plan-categories.update', category.id),
            {
                name: category.name,
                description: category.description || '',
                network_id: category.network_id.toString(),
                phone_number_id: category.phone_number_id ? category.phone_number_id.toString() : '',
                dispense_method: category.dispense_method,
                status: newStatus,
                type: category.type,
            },
            {
                onSuccess: () => {
                    toast.success(`Category ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Failed to update category status');
                },
            },
        );
    };

    // Update a category
    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingCategory) return;

        editForm.put(route('settings.data-plan-categories.update', editingCategory.id), {
            onSuccess: () => {
                setEditingCategory(null);
                toast.success('Category updated successfully');
            },
            onError: (errors) => {
                console.error(errors);
                Object.keys(errors).forEach((key) => {
                    toast.error(errors[key]);
                });
            },
        });
    };

    // Create a new category
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        createForm.post(route('settings.data-plan-categories.store'), {
            onSuccess: () => {
                setIsCreating(false);
                createForm.reset();
                createForm.setData('type', activeTab);
                toast.success('Category created successfully');
            },
            onError: (errors) => {
                console.error(errors);
                Object.keys(errors).forEach((key) => {
                    toast.error(errors[key]);
                });
            },
        });
    };

    // Get icon for dispense method
    const getDispenseMethodIcon = (method: string) => {
        switch (method) {
            case 'CLOUD':
                return <Server className="h-4 w-4" />;
            case 'DEVICE':
                return <Smartphone className="h-4 w-4" />;
            case 'WALLET':
                return <Wallet className="h-4 w-4" />;
            default:
                return <Settings className="h-4 w-4" />;
        }
    };

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (isCreating) {
            createForm.setData('type', value);
        }
    };

    return (
        <AppLayout>
            <Head title="Data Plan Categories Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Plan Categories Settings</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage settings for different types of data plan categories.</p>
                    </div>

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="mb-6 grid w-full grid-cols-2 md:grid-cols-4">
                            {Object.keys(categories).map((type) => (
                                <TabsTrigger key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {Object.entries(categories).map(([type, categoryList]) => (
                            <TabsContent key={type} value={type} className="w-full">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-lg font-medium">{type.charAt(0).toUpperCase() + type.slice(1)} Categories</h3>
                                    <Button
                                        onClick={() => {
                                            setIsCreating(true);
                                            createForm.reset();
                                            createForm.setData('type', type);
                                        }}
                                        className="bg-theme-1 hover:bg-theme-1/90 text-white"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add New Category
                                    </Button>
                                </div>

                                {/* Create New Category Form */}
                                {isCreating && createForm.data.type === type && (
                                    <Card className="mb-6">
                                        <CardHeader>
                                            <CardTitle>Create New Category</CardTitle>
                                            <CardDescription>Add a new data plan category for {type.toLowerCase()}.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleCreate} className="space-y-4">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="create-name">Name</Label>
                                                        <Input
                                                            id="create-name"
                                                            value={createForm.data.name}
                                                            onChange={(e) => createForm.setData('name', e.target.value)}
                                                            placeholder="e.g. MTN Monthly Bundle"
                                                            required
                                                        />
                                                        <InputError message={createForm.errors.name} />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="create-network">Network</Label>
                                                        <Select
                                                            value={createForm.data.network_id}
                                                            onValueChange={(value) => createForm.setData('network_id', value)}
                                                        >
                                                            <SelectTrigger id="create-network">
                                                                <SelectValue placeholder="Select network" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {networks.map((network) => (
                                                                    <SelectItem key={network.id} value={network.id.toString()}>
                                                                        {network.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <InputError message={createForm.errors.network_id} />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="create-dispense-method">Dispense Method</Label>
                                                        <Select
                                                            value={createForm.data.dispense_method}
                                                            onValueChange={(value) => createForm.setData('dispense_method', value)}
                                                        >
                                                            <SelectTrigger id="create-dispense-method">
                                                                <SelectValue placeholder="Select dispense method" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.entries(dispenseMethodOptions).map(([value, label]) => (
                                                                    <SelectItem key={value} value={value}>
                                                                        {label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <InputError message={createForm.errors.dispense_method} />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="create-phone-number">Associated Phone Number (Optional)</Label>
                                                        <Select
                                                            value={createForm.data.phone_number_id}
                                                            onValueChange={(value) => createForm.setData('phone_number_id', value)}
                                                        >
                                                            <SelectTrigger id="create-phone-number">
                                                                <SelectValue placeholder="Select phone number" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="">None</SelectItem>
                                                                {phoneNumbers.map((phone) => (
                                                                    <SelectItem key={phone.id} value={phone.id.toString()}>
                                                                        {phone.number} ({phone.network.name})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <InputError message={createForm.errors.phone_number_id} />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="create-description">Description</Label>
                                                    <Textarea
                                                        id="create-description"
                                                        value={createForm.data.description}
                                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                                        placeholder="Enter a description"
                                                        rows={3}
                                                    />
                                                    <InputError message={createForm.errors.description} />
                                                </div>

                                                <div className="flex justify-end space-x-2">
                                                    <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        className="bg-theme-1 hover:bg-theme-1/90 text-white"
                                                        disabled={createForm.processing}
                                                    >
                                                        {createForm.processing ? 'Creating...' : 'Create Category'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="grid grid-cols-1 gap-6">
                                    {categoryList.length === 0 ? (
                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="py-8 text-center">
                                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                                        <Settings className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                                                    </div>
                                                    <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">No Categories</h3>
                                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                        No data plan categories found for this type.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        categoryList.map((category) => (
                                            <Card key={category.id} className={editingCategory?.id === category.id ? 'border-theme-1' : ''}>
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <CardTitle>{category.name}</CardTitle>
                                                            <div
                                                                className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${
                                                                    category.status === 'ACTIVE'
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                                }`}
                                                            >
                                                                {category.status}
                                                            </div>
                                                        </div>

                                                        {editingCategory?.id !== category.id && (
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    variant={category.status === 'ACTIVE' ? 'default' : 'outline'}
                                                                    size="sm"
                                                                    onClick={() => toggleStatus(category)}
                                                                    className={
                                                                        category.status === 'ACTIVE'
                                                                            ? 'bg-green-600 hover:bg-green-700'
                                                                            : 'border-red-300 text-red-600 hover:bg-red-50'
                                                                    }
                                                                >
                                                                    {category.status === 'ACTIVE' ? (
                                                                        <Check className="mr-1 h-4 w-4" />
                                                                    ) : (
                                                                        <PowerOff className="mr-1 h-4 w-4" />
                                                                    )}
                                                                    {category.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                                                </Button>
                                                                <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                                                                    Edit
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <CardDescription className="flex items-center gap-1">
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            Network: {category.network.name}
                                                        </span>
                                                        <span className="mx-1">•</span>
                                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                            {getDispenseMethodIcon(category.dispense_method)}
                                                            <span className="ml-1">{dispenseMethodOptions[category.dispense_method]}</span>
                                                        </div>
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    {editingCategory?.id === category.id ? (
                                                        <form onSubmit={handleUpdate} className="space-y-4">
                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="edit-name">Name</Label>
                                                                    <Input
                                                                        id="edit-name"
                                                                        value={editForm.data.name}
                                                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                                                        placeholder="e.g. MTN Monthly Bundle"
                                                                        required
                                                                    />
                                                                    <InputError message={editForm.errors.name} />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="edit-network">Network</Label>
                                                                    <Select
                                                                        value={editForm.data.network_id}
                                                                        onValueChange={(value) => editForm.setData('network_id', value)}
                                                                    >
                                                                        <SelectTrigger id="edit-network">
                                                                            <SelectValue placeholder="Select network" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {networks.map((network) => (
                                                                                <SelectItem key={network.id} value={network.id.toString()}>
                                                                                    {network.name}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <InputError message={editForm.errors.network_id} />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="edit-dispense-method">Dispense Method</Label>
                                                                    <Select
                                                                        value={editForm.data.dispense_method}
                                                                        onValueChange={(value) => editForm.setData('dispense_method', value)}
                                                                    >
                                                                        <SelectTrigger id="edit-dispense-method">
                                                                            <SelectValue placeholder="Select dispense method" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {Object.entries(dispenseMethodOptions).map(([value, label]) => (
                                                                                <SelectItem key={value} value={value}>
                                                                                    {label}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <InputError message={editForm.errors.dispense_method} />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="edit-phone-number">Associated Phone Number (Optional)</Label>
                                                                    <Select
                                                                        value={editForm.data.phone_number_id}
                                                                        onValueChange={(value) => editForm.setData('phone_number_id', value)}
                                                                    >
                                                                        <SelectTrigger id="edit-phone-number">
                                                                            <SelectValue placeholder="Select phone number" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="">None</SelectItem>
                                                                            {phoneNumbers.map((phone) => (
                                                                                <SelectItem key={phone.id} value={phone.id.toString()}>
                                                                                    {phone.number} ({phone.network.name})
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <InputError message={editForm.errors.phone_number_id} />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="edit-description">Description</Label>
                                                                <Textarea
                                                                    id="edit-description"
                                                                    value={editForm.data.description}
                                                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                                                    placeholder="Enter a description"
                                                                    rows={3}
                                                                />
                                                                <InputError message={editForm.errors.description} />
                                                            </div>

                                                            <div className="flex justify-end space-x-2">
                                                                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    type="submit"
                                                                    className="bg-theme-1 hover:bg-theme-1/90 text-white"
                                                                    disabled={editForm.processing}
                                                                >
                                                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {category.description && (
                                                                <div>
                                                                    <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        Description
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                                                                </div>
                                                            )}

                                                            {category.phoneNumber && (
                                                                <div>
                                                                    <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        Associated Phone Number
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {category.phoneNumber.number} ({category.phoneNumber.network.name})
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {category.dataPlans?.length > 0 && (
                                                                <div>
                                                                    <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        Associated Data Plans ({category.dataPlans.length})
                                                                    </h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {category.dataPlans.slice(0, 5).map((plan) => (
                                                                            <div
                                                                                key={plan.id}
                                                                                className="rounded-md bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700"
                                                                            >
                                                                                {plan.name}
                                                                            </div>
                                                                        ))}
                                                                        {category.dataPlans.length > 5 && (
                                                                            <div className="rounded-md bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
                                                                                +{category.dataPlans.length - 5} more
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
