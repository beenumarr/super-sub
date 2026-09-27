import { memo, FC } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    phone: string;
}

interface TransactionRow {
    id: number;
    reference: string;
    amount: string | number;
    description: string;
    date: string;
    status: string;
    api_response: string;
    balance_before?: string | number;
    balance_after?: string | number;
    user: User;
    type?: string;
    transactionable_type?: string;
    metadata?: Record<string, any>;
}

interface TransactionTableProps {
    data: {
        data: TransactionRow[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            path: string;
            per_page: number;
            to: number;
            total: number;
        };
        links: {
            first: string;
            last: string;
            prev: string | null;
            next: string | null;
        };
    };
    setViewDetailModal: (val: { show: boolean; id: string | number }) => void;
}

const getStatusColor = (status: string): string => {
    switch (status?.toUpperCase()) {
        case 'SUCCESS':
        case 'COMPLETED':
            return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
        case 'PENDING':
            return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
        case 'FAILED':
        case 'ERROR':
            return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-100';
    }
};

const TransactionTable: FC<TransactionTableProps> = ({ data, setViewDetailModal }) => {
    return (
        <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="whitespace-nowrap">Reference ID</TableHead>
                        <TableHead className="whitespace-nowrap">Type</TableHead>
                        <TableHead className="whitespace-nowrap">Amount</TableHead>
                        <TableHead className="whitespace-nowrap">Description</TableHead>
                        <TableHead className="whitespace-nowrap">Date</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">API Response</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                No transactions found
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.data.map((row) => (
                            <TableRow
                                key={row.id}
                                onClick={() => setViewDetailModal({ show: true, id: row.id })}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900"
                            >
                                <TableCell className="font-medium text-sm whitespace-nowrap">{row.reference}</TableCell>
                                <TableCell className="text-sm whitespace-nowrap">
                                    <Badge variant="outline">{row.transactionable_type?.replace('App\\Models\\', '') || 'N/A'}</Badge>
                                </TableCell>
                                <TableCell className="text-sm whitespace-nowrap">₦{row.amount}</TableCell>
                                <TableCell className="text-sm max-w-xs truncate">{row.description}</TableCell>
                                <TableCell className="text-sm whitespace-nowrap">
                                    {row.date}
                                </TableCell>
                                <TableCell className="text-sm">
                                    <Badge variant="outline" className={getStatusColor(row.status)}>
                                        {row.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm max-w-xs truncate text-gray-600" title={row.api_response}>
                                    {row.api_response || 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {data.meta?.last_page > 1 && (
                <div className="flex items-center justify-between border-t bg-white p-4 dark:bg-gray-800">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-medium">{data.meta.from}</span> to{' '}
                        <span className="font-medium">{data.meta.to}</span> of{' '}
                        <span className="font-medium">{data.meta.total}</span> transactions
                    </div>
                    <div className="flex gap-2">
                        {data.links.prev ? (
                            <Link href={data.links.prev}>
                                <Button variant="outline" size="sm">
                                    Previous
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="outline" size="sm" disabled>
                                Previous
                            </Button>
                        )}

                        <span className="flex items-center px-2 text-sm text-gray-600 dark:text-gray-400">
                            Page {data.meta.current_page} of {data.meta.last_page}
                        </span>

                        {data.links.next ? (
                            <Link href={data.links.next}>
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
        </div>
    );
};

export default memo(TransactionTable);
