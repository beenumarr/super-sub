import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Label } from '@radix-ui/react-label';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface DataPlanCategory {
    id: number;
    name: string;
    description: string;
    status: string;
}

interface Network {
    id: number;
    name: string;
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
    status: 'ACTIVE' | 'INACTIVE';
    plan_type: string;
    category: {
        id: number;
        name: string;
        type: string;
    };
    created_at: string;
    updated_at: string;
}

interface DataPlansProps {
    dataPlans: DataPlan[];
    categories: DataPlanCategory[];
    networks: Network[];
    filters: {
        network: string;
    };
}

export default function DataPlans({ dataPlans, networks, filters }: DataPlansProps) {
    const [networkFilter, setNetworkFilter] = useState(filters.network || '1');

    useEffect(() => {
        const handler = setTimeout(() => {
            applyFilters();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [networkFilter]);

    const applyFilters = () => {
        // Build query parameters for server-side filtering
        const params: Record<string, string> = {};

        if (networkFilter !== '') {
            params.network = networkFilter;
        }

        // Use Inertia router to reload the page with query parameters
        router.get(route('data-plans-list'), params, {
            preserveState: true,
            replace: true,
            onError: () => {
                toast.error('Failed to apply filters');
            },
        });
    };

    // Group data plans by category
    const groupedDataPlans = dataPlans.reduce<Record<string, DataPlan[]>>((groups, plan) => {
        const categoryName = plan.category.name;
        if (!groups[categoryName]) {
            groups[categoryName] = [];
        }
        groups[categoryName].push(plan);
        return groups;
    }, {});

    // Sort categories alphabetically
    const sortedCategories = Object.keys(groupedDataPlans).sort();

    return (
        <AppLayout>
            <Head title="Data Plans Management" />

            <div className="px-4 py-12 lg:px-0">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Plans List</h2>
                    </div>

                    <Tabs value={networkFilter} onValueChange={setNetworkFilter} className="w-full">
                        <RadioGroup value={networkFilter || ''} onValueChange={setNetworkFilter} className="contents">
                            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {networks.map((network) => (
                                    <Label
                                        htmlFor={`network-filter-${network.id}`}
                                        key={network.id}
                                        className={`group relative flex w-full items-center rounded-lg border-2 p-3 shadow-sm transition-all duration-300 ${
                                            network.status === 'INACTIVE'
                                                ? 'cursor-not-allowed border-gray-300 bg-gray-100 opacity-50 dark:border-gray-600 dark:bg-gray-700'
                                                : `cursor-pointer hover:scale-105 hover:shadow-md ${
                                                      networkFilter === network.id.toString()
                                                          ? 'border-theme-1 from-theme-1/20 to-theme-1/10 shadow-theme-1/25 bg-gradient-to-br'
                                                          : 'hover:border-theme-1/30 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                                  }`
                                        }`}
                                    >
                                        <RadioGroupItem
                                            value={network.id.toString()}
                                            id={`network-filter-${network.id}`}
                                            className="absolute top-1 right-1 hidden"
                                        />
                                        <img
                                            src={`/images/icons/${network.name.toLowerCase()}.png`}
                                            alt={`${network.name} logo`}
                                            className="h-8 w-8 rounded object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                        <span className="ml-3 hidden font-medium text-gray-900 sm:inline dark:text-white">{network.name}</span>
                                        {networkFilter === network.id.toString() && (
                                            <div className="from-theme-1/10 absolute inset-0 rounded-lg bg-gradient-to-br to-transparent"></div>
                                        )}
                                    </Label>
                                ))}
                            </div>
                        </RadioGroup>

                        <TabsContent value={networkFilter || ''} className="mt-0 space-y-6">
                            {sortedCategories.map((categoryName) => (
                                <Card key={categoryName} className="bg-accent/40 shadow">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">{categoryName}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-4 py-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Plan ID</TableHead>
                                                    <TableHead>Validity</TableHead>
                                                    <TableHead>Telco Price</TableHead>
                                                    <TableHead>Our Price</TableHead>
                                                    <TableHead>Size</TableHead>
                                                    {/* <TableHead>Status</TableHead> */}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {(() => {
                                                    // Group plans by validity period
                                                    const validityGroups = groupedDataPlans[categoryName].reduce<Record<string, DataPlan[]>>(
                                                        (groups, plan) => {
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
                                                                validityGroup = 'Other'; // Default catch-all
                                                            }

                                                            if (!groups[validityGroup]) {
                                                                groups[validityGroup] = [];
                                                            }
                                                            groups[validityGroup].push(plan);
                                                            return groups;
                                                        },
                                                        {} as Record<string, DataPlan[]>,
                                                    );

                                                    const validityOrder = [
                                                        'Daily',
                                                        '2 Days',
                                                        '3 Days',
                                                        'Weekly',
                                                        'Monthly',
                                                        'Long Term',
                                                        'Yearly',
                                                        'Other',
                                                    ];
                                                    const sortedValidityGroups = validityOrder.filter((group) => validityGroups[group]);

                                                    return sortedValidityGroups.map((validityGroup, groupIndex) => (
                                                        <React.Fragment key={validityGroup}>
                                                            {groupIndex > 0 && (
                                                                <TableRow className="border-0">
                                                                    <TableCell colSpan={6} className="h-4 border-0 p-0"></TableCell>
                                                                </TableRow>
                                                            )}
                                                            <TableRow className="border-0">
                                                                <TableCell colSpan={6} className="border-0 pt-2 pb-2">
                                                                    <h4 className="bg-accent -m-2 mt-4 rounded-t-md p-2 font-semibold text-gray-700 dark:text-gray-300">
                                                                        {validityGroup}
                                                                    </h4>
                                                                </TableCell>
                                                            </TableRow>
                                                            {validityGroups[validityGroup].map((plan: DataPlan) => (
                                                                <TableRow key={plan.id}>
                                                                    <TableCell className="font-medium">{plan.name}</TableCell>
                                                                    <TableCell>{plan.id}</TableCell>
                                                                    <TableCell>
                                                                        {plan.validity
                                                                            ? `${plan.validity} day${plan.validity > 1 ? 's' : ''}`
                                                                            : 'N/A'}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {plan.category.type === 'DATA_SHARE' ? 'N/A' : '₦' + plan.telco_price}
                                                                    </TableCell>
                                                                    <TableCell>N/A </TableCell>

                                                                    <TableCell>{`${plan.size} ${plan.volume}`}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </React.Fragment>
                                                    ));
                                                })()}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            ))}

                            {sortedCategories.length === 0 && (
                                <Card className="bg-accent/40 shadow">
                                    <CardContent className="p-6">
                                        <p className="py-4 text-center text-gray-500">No data plans found for the selected network.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
