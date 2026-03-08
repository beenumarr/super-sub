import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import ManagePlans, { DataPlan } from './ManagePlans';

interface PhoneNumber {
    id: number;
    number: string;
    plan_type_purchased: string;
    network: {
        name: string;
    };
}

interface Category {
    id: number;
    name: string;
    type: string;
    network: {
        id: number;
        name: string;
    };
}

interface CategorySetting {
    dispense_method: 'WALLET' | 'SIM' | 'SMARTCASH_AIRTIME' | 'SMARTCASH_WALLET' | 'MOMO';
    status: 'ACTIVE' | 'INACTIVE';
    phone_number_id: string | null;
}

interface UserSettingsProps {
    categorySettings: Record<number, CategorySetting>;
    categories: Category[];
    phoneNumbers: PhoneNumber[];
    dispenseMethodOptions: Record<string, string>;
    planDispenseMethodOptions: Record<string, string>;
    status: string;
    category: Category;
    type: string;
    dataPlans: DataPlan[];
    planSettings: Record<string, { dispense_method: string }>;
}

type DispenseMethod = 'WALLET' | 'SIM' | 'SMARTCASH_AIRTIME' | 'SMARTCASH_WALLET' | 'MOMO';
type Status = 'ACTIVE' | 'INACTIVE';

export default function UserSettingsPage({
    categorySettings,
    category,
    phoneNumbers,
    dispenseMethodOptions,
    planDispenseMethodOptions,
    type,
    dataPlans,
    planSettings,
}: UserSettingsProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form for editing user settings for all categories
    const form = useForm({
        settings: Object.entries(categorySettings).reduce(
            (acc, [categoryId, setting]) => {
                acc[categoryId] = {
                    dispense_method: setting.dispense_method,
                    status: setting.status,
                    phone_number_id: setting.phone_number_id ? setting.phone_number_id.toString() : 'none',
                };
                return acc;
            },
            {} as Record<string, { dispense_method: DispenseMethod; status: Status; phone_number_id: string }>,
        ),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        form.put(route('user.settings.update'), {
            onSuccess: () => {
                setIsSubmitting(false);
                toast.success('Settings updated successfully');
                router.reload();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                Object.keys(errors).forEach((key) => {
                    toast.error(errors[key]);
                });
            },
        });
    };

    if (status) {
        toast.success(status);
    }

    return (
        <AppLayout>
            <Head title="Category Settings" />

            <div className="py-4 sm:py-6">
                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <Card className="border-0 p-0">
                            <CardHeader className="p-2 sm:p-4">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="text-sm font-medium">
                                        {category.network.name} {category.name}
                                    </div>
                                    <div className="space-x-2">
                                        <Switch
                                            id={`status-${category.id}`}
                                            checked={form.data.settings[category.id]?.status === 'ACTIVE'}
                                            onCheckedChange={(checked) =>
                                                form.setData((prev) => ({
                                                    ...prev,
                                                    settings: {
                                                        ...prev.settings,
                                                        [category.id]: {
                                                            ...prev.settings[category.id],
                                                            status: checked ? 'ACTIVE' : 'INACTIVE',
                                                        },
                                                    },
                                                }))
                                            }
                                        />
                                        <Label htmlFor={`status-${category.id}`}>
                                            {form.data.settings[category.id]?.status === 'ACTIVE' ? 'ON' : 'OFF'}
                                        </Label>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 py-0 sm:p-4">
                                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                    {type !== 'mtn-momo-psb' && (
                                        <div className="w-full space-y-2">
                                            <Label htmlFor={`dispense-method-${category.id}`}>Dispense Method</Label>
                                            <Select
                                                value={form.data.settings[category.id]?.dispense_method}
                                                onValueChange={(value: DispenseMethod) =>
                                                    form.setData((prev) => ({
                                                        ...prev,
                                                        settings: {
                                                            ...prev.settings,
                                                            [category.id]: {
                                                                ...prev.settings[category.id],
                                                                dispense_method: value,
                                                            },
                                                        },
                                                    }))
                                                }
                                            >
                                                <SelectTrigger id={`dispense-method-${category.id}`}>
                                                    <SelectValue placeholder="Select dispense method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(dispenseMethodOptions).map(([value, label]) => (
                                                        <SelectItem key={value} value={value} className="flex items-center gap-2">
                                                            <div className="flex items-center gap-2">
                                                                {/* {getDispenseMethodIcon(value)} */}
                                                                <span>{label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* @ts-expect-error Dynamic property access */}
                                            <InputError message={form.errors[`settings.${category.id}.dispense_method`]} />
                                        </div>
                                    )}

                                    <div className="flex w-full space-x-2">
                                        <div className="w-full space-y-2">
                                            <Label htmlFor={`phone-number-${category.id}`}>Dispense SIM</Label>
                                            <Select
                                                value={form.data.settings[category.id]?.phone_number_id}
                                                onValueChange={(value) => {
                                                    form.setData((prev) => ({
                                                        ...prev,
                                                        settings: {
                                                            ...prev.settings,
                                                            [category.id]: {
                                                                ...prev.settings[category.id],
                                                                phone_number_id: value,
                                                            },
                                                        },
                                                    }));
                                                }}
                                            >
                                                <SelectTrigger id={`phone-number-${category.id}`}>
                                                    <SelectValue placeholder="Select phone number" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {phoneNumbers.map((phone) => (
                                                        <SelectItem key={phone.id} value={phone.id.toString()}>
                                                            {phone.number} ({phone.plan_type_purchased})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* @ts-expect-error Dynamic property access */}
                                            <InputError message={form.errors[`settings.${category.id}.phone_number_id`]} />
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <Button type="submit" className="bg-theme-1 hover:bg-theme-1/90 text-white" disabled={isSubmitting}>
                                                {isSubmitting ? 'Saving...' : 'Save Settings'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>

                    {/* Individual Plan Settings */}
                    <ManagePlans
                        dataPlans={dataPlans}
                        categoryId={category.id}
                        categoryDispenseMethod={form.data.settings[category.id]?.dispense_method || 'WALLET'}
                        planSettings={planSettings}
                        dispenseMethodOptions={planDispenseMethodOptions}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
