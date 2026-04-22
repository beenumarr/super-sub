import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
    links?: { url: string | null; label: string; active: boolean }[];
}

export interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

export interface DataTableColumn<T> {
    key: string;
    header: React.ReactNode;
    className?: string;
    render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data: T[];
    meta?: PaginationMeta;
    links?: PaginationLinks;
    onPageChange?: (page: number) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
    getRowId?: (row: T) => string | number;
}

export function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    meta,
    links,
    onPageChange,
    isLoading = false,
    emptyMessage = 'No data found',
    className,
    getRowId = (row) => (row.id as string | number) ?? Math.random(),
}: DataTableProps<T>) {
    return (
        <div className={cn('space-y-4', className)}>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.key} className={col.className}>
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((col) => (
                                        <TableCell key={col.key}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow key={String(getRowId(row))}>
                                    {columns.map((col) => (
                                        <TableCell key={col.key} className={col.className}>
                                            {col.render
                                                ? col.render(row)
                                                : String(row[col.key] ?? '')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {meta && links && onPageChange && meta.last_page > 1 && !isLoading && (
                <Pagination
                    meta={meta}
                    links={links}
                    onPageChange={onPageChange}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}
