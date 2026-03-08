import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transaction Charges',
        href: '/user-settings/charges',
    },
];

interface CategoryCharge {
    id: number;
    name: string;
    network: string;
    charge: number;
}

interface PlanCharge {
    id: number;
    name: string;
    size: number;
    volume: string;
    category: string;
    network: string;
    charge: number;
}

interface ChargesProps {
    categoryCharges: CategoryCharge[];
    planCharges: PlanCharge[];
}

export default function Charges({ categoryCharges, planCharges }: ChargesProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Charges" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Usage Fees" />

                    <div className="space-y-6">
                        {/* Category Charges */}
                        {categoryCharges.length > 0 && (
                            <Card className="border-0 p-0">
                                <CardContent>
                                    <div className="">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Network</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead className="text-right">Amount (₦)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {categoryCharges.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-muted-foreground text-center">
                                                            No category charges configured
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    categoryCharges
                                                        .filter((charge) => !(charge.name === 'Data Share' && charge.network !== 'MTN'))
                                                        .map((charge) => (
                                                            <TableRow key={charge.id}>
                                                                <TableCell className="font-medium">{charge.network}</TableCell>
                                                                <TableCell>{charge.name}</TableCell>
                                                                <TableCell className="text-right">₦{charge.charge.toFixed(2)}</TableCell>
                                                            </TableRow>
                                                        ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Plan Charges */}
                        {planCharges.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Plan Charges</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Network</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Plan</TableHead>
                                                    <TableHead>Size</TableHead>
                                                    <TableHead className="text-right">Charge (₦)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {planCharges.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-muted-foreground text-center">
                                                            No plan charges configured
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    planCharges.map((charge) => (
                                                        <TableRow key={charge.id}>
                                                            <TableCell className="font-medium">{charge.network}</TableCell>
                                                            <TableCell>{charge.category}</TableCell>
                                                            <TableCell>{charge.name}</TableCell>
                                                            <TableCell>
                                                                {charge.size} {charge.volume}
                                                            </TableCell>
                                                            <TableCell className="text-right">₦{charge.charge.toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {categoryCharges.length === 0 && planCharges.length === 0 && (
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <p className="text-muted-foreground">No charges available at this time.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
