import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { memo } from 'react';

const statusOptions = [
    { id: '', name: 'All Status' },
    { id: 'failed', name: 'Failed' },
    { id: 'pending', name: 'Pending' },
    { id: 'success', name: 'Success' },
    { id: 'refunded', name: 'Refunded' },
];

interface DataPlanHeaderFiltersProps {
    setFilter: (filters: { status: string }) => void;
    filters: { status: string };
}

function DataPlanHeaderFilters({ setFilter, filters }: DataPlanHeaderFiltersProps) {
    return (
        <Select
            value={filters.status || 'none'}
            onValueChange={(v) => setFilter({ ...filters, status: v === 'none' ? '' : v })}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="none">All Status</SelectItem>
                {statusOptions
                    .filter((o) => o.id)
                    .map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                            {opt.name}
                        </SelectItem>
                    ))}
            </SelectContent>
        </Select>
    );
}

export default memo(DataPlanHeaderFilters);
