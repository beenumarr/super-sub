import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowRight, FileBarChart, Filter } from 'lucide-react';

interface Transaction {
    id: number;
    reference_id: string;
    provider_name: string;
    provider_reference: string | null;
    amount: number;
    formatted_amount?: string;
    description: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    status_color: string;
    created_at: string;
    api_response: string;
    metadata: {
        phone_number: string;
        beneficiary: string;
        telco_price: string;
        plan_category: string;
        data_plan: string;
        network: string;
        size: number;
        volume: string;
        validity: string;
    };
}

interface TransactionHistoryProps {
    transactions: {
        data: Transaction[];
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
    };
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
    return (
        <AppLayout>
            <Head title="Data Transaction History" />

            <div className="px-4 py-12 lg:px-0">
                <div className="mx-auto max-w-screen sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Transaction History</h2>
                        <Link href={route('data-transactions.index')}>
                            <Button variant="secondary" className="bg-theme-1 hover:bg-theme-1/90 text-white">
                                Buy Data
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <Card className="bg-accent/40 shadow">
                        <CardContent className="p-6">
                            {transactions.data.length === 0 ? (
                                <div className="py-8 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <FileBarChart className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                                    </div>
                                    <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">No Transactions</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You haven't made any data transactions yet.</p>
                                    <div className="mt-6">
                                        <Link href={route('data-transactions.index')}>
                                            <Button variant="secondary" className="bg-theme-1 hover:bg-theme-1/90 text-white">
                                                Buy Data
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 flex justify-end">
                                        <Button variant="outline" size="sm" className="text-xs">
                                            <Filter className="mr-2 h-3 w-3" />
                                            Filter
                                        </Button>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Ref</TableHead>
                                                <TableHead>Plan</TableHead>
                                                <TableHead>Beneficiary</TableHead>
                                                <TableHead>Network</TableHead>
                                                <TableHead>Channel</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>API Response</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.data.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <div>{transaction.reference_id}</div>
                                                            <div className="text-sm text-gray-400">
                                                                {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            {transaction.metadata.data_plan} | {transaction.metadata.plan_category}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>{transaction.metadata.beneficiary}</TableCell>
                                                    <TableCell>{transaction.metadata.network}</TableCell>

                                                    <TableCell>
                                                        {transaction.provider_name}|{transaction.metadata.phone_number}
                                                    </TableCell>

                                                    <TableCell>
                                                        Price: {transaction.amount} | Telco Price: {transaction.metadata.telco_price}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                transaction.status === 'SUCCESS'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                                    : transaction.status === 'PENDING'
                                                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                                                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                                            }
                                                        >
                                                            {transaction.status}
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell>
                                                        <div className="max-w-[400px] text-wrap" title={transaction.api_response}>
                                                            {transaction.api_response}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {transactions?.meta?.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                            <div className="text-sm text-gray-500">
                                                Showing <span className="font-medium">{transactions.meta.from}</span> to{' '}
                                                <span className="font-medium">{transactions.meta.to}</span> of{' '}
                                                <span className="font-medium">{transactions.meta.total}</span> transactions
                                            </div>
                                            <div className="flex gap-x-2">
                                                {transactions.links.prev ? (
                                                    <Link href={transactions.links.prev}>
                                                        <Button variant="outline" size="sm">
                                                            Previous
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button variant="outline" size="sm" disabled>
                                                        Previous
                                                    </Button>
                                                )}

                                                {transactions.links.next ? (
                                                    <Link href={transactions.links.next}>
                                                        <Button variant="outline" size="sm">
                                                            Next
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button variant="outline" size="sm" disabled>
                                                        Next
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
