import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export interface DataPlan {
    id: number;
    name: string;
    validity: number | null;
    size: number;
    volume: 'MB' | 'GB' | 'TB';
    description: string | null;
    api_id: string;
    telco_price: number;
    price: number;
    status: 'ACTIVE' | 'INACTIVE';
    plan_type: string;
    created_at: string;
    updated_at: string;
}

export interface ManagePlansProps {
    dataPlans: DataPlan[];
    categoryId: number;
    categoryDispenseMethod: string;
    planSettings: Record<string, { dispense_method: string }>;
    dispenseMethodOptions: Record<string, string>;
}

type DispenseMethod = 'DEFAULT' | 'WALLET' | 'SIM' | 'SMARTCASH_AIRTIME' | 'SMARTCASH_WALLET' | 'MOMO';

export default function ManagePlans({ dataPlans, categoryId, categoryDispenseMethod, planSettings, dispenseMethodOptions }: ManagePlansProps) {
    const [settings, setSettings] = useState<Record<string, { dispense_method: string }>>(planSettings);
    const [savingPlanId, setSavingPlanId] = useState<number | null>(null);

    const handleDispenseMethodChange = (planId: number, value: DispenseMethod) => {
        setSavingPlanId(planId);

        // Optimistically update local state
        setSettings((prev) => ({
            ...prev,
            [planId]: { dispense_method: value },
        }));

        // Post directly with the data
        router.post(
            route('user.settings.update-plan'),
            {
                category_id: categoryId,
                plan_id: planId,
                dispense_method: value,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSavingPlanId(null);
                    toast.success('Setting saved');
                },
                onError: (errors: Record<string, string>) => {
                    // Revert on error
                    setSettings((prev) => ({
                        ...prev,
                        [planId]: planSettings[planId] || { dispense_method: 'DEFAULT' },
                    }));
                    setSavingPlanId(null);
                    const errorMessage = Object.values(errors)[0] || 'Failed to save setting';
                    toast.error(errorMessage);
                },
            },
        );
    };

    // Group data plans by validity period
    const groupPlansByValidity = (plans: DataPlan[]) => {
        return plans.reduce<Record<string, DataPlan[]>>((groups, plan) => {
            let validityGroup: string;
            if (plan.validity === null) {
                validityGroup = 'Other';
            } else if (plan.validity === 1) {
                validityGroup = 'Daily';
            } else if (plan.validity === 2) {
                validityGroup = '2 Days';
            } else if (plan.validity === 3) {
                validityGroup = '3 Days';
            } else if (plan.validity >= 4 && plan.validity <= 7) {
                validityGroup = 'Weekly';
            } else if (plan.validity >= 8 && plan.validity <= 31) {
                validityGroup = 'Monthly';
            } else if (plan.validity >= 32 && plan.validity <= 90) {
                validityGroup = 'Long Term';
            } else if (plan.validity > 90) {
                validityGroup = 'Yearly';
            } else {
                validityGroup = 'Other';
            }

            if (!groups[validityGroup]) {
                groups[validityGroup] = [];
            }
            groups[validityGroup].push(plan);
            return groups;
        }, {});
    };

    const validityGroups = groupPlansByValidity(dataPlans);
    const validityOrder = ['Daily', '2 Days', '3 Days', 'Weekly', 'Monthly', 'Long Term', 'Yearly', 'Other'];
    const sortedValidityGroups = validityOrder.filter((group) => validityGroups[group]);

    if (dataPlans.length === 0) {
        return null;
    }

    return (
        <Card className="mt-6 p-2 sm:p-2">
            <CardHeader className="p-2 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">Plan Dispense Settings </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Plans set to "Default" will use: <span className="font-medium text-gray-700 dark:text-gray-300">{categoryDispenseMethod}</span>
                </p>
            </CardHeader>
            <CardContent className="-p-2 -px-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Plan ID</TableHead>
                            <TableHead>Validity</TableHead>

                            <TableHead className="w-64">Dispense Channel</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedValidityGroups.map((validityGroup, groupIndex) => (
                            <React.Fragment key={validityGroup}>
                                {groupIndex > 0 && (
                                    <TableRow className="border-0">
                                        <TableCell colSpan={6} className="h-4 border-0 p-0"></TableCell>
                                    </TableRow>
                                )}
                                <TableRow className="border-t-0">
                                    <TableCell colSpan={6} className="border-0 pt-2 pb-2">
                                        <h4 className="bg-accent -m-2 mt-4 rounded-t-md p-2 font-semibold text-gray-700 dark:text-gray-300">
                                            {validityGroup}
                                        </h4>
                                    </TableCell>
                                </TableRow>
                                {validityGroups[validityGroup].map((plan: DataPlan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell className="text-sm font-medium">{plan.name}</TableCell>
                                        <TableCell>{plan.id}</TableCell>
                                        <TableCell>{plan.validity ? `${plan.validity} day${plan.validity > 1 ? 's' : ''}` : 'N/A'}</TableCell>

                                        <TableCell>
                                            <Select
                                                value={settings[plan.id]?.dispense_method || 'DEFAULT'}
                                                onValueChange={(value: DispenseMethod) => handleDispenseMethodChange(plan.id, value)}
                                                disabled={savingPlanId === plan.id}
                                            >
                                                <SelectTrigger className={`w-full ${savingPlanId === plan.id ? 'opacity-50' : ''}`}>
                                                    <SelectValue placeholder="Select dispense method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(dispenseMethodOptions).map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            <div className="flex items-center gap-2">
                                                                {/* {getDispenseMethodIcon(value)} */}
                                                                <span>{label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
