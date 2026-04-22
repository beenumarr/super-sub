import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { DataTableColumn } from '@/components/shared/data-table';

export interface DataPlanRow {
    id: number;
    name: string;
    plan_type: string;
    plan_size: number;
    plan_volume: string;
    amount: number;
    plan_validity: number | string;
    mobile_network?: { name: string };
    [key: string]: unknown;
}

export function getDataPlanColumns(
    setEditFormModal: (state: { show: boolean; id: string | number }) => void,
    setDeleteModal: (state: { show: boolean; id: string | number }) => void,
    canEditDataPlan = false,
    canDeleteDataPlan = false,
): DataTableColumn<DataPlanRow>[] {
    const columns: DataTableColumn<DataPlanRow>[] = [
        {
            key: 'name',
            header: 'Name',
            className: 'min-w-[150px]',
        },
        {
            key: 'plan_type',
            header: 'Plan Type',
            className: 'min-w-[120px]',
        },
        {
            key: 'plan_size',
            header: 'Plan',
            render: (row) => (
                <span className="uppercase">
                    {row.plan_size}
                    {row.plan_volume}
                </span>
            ),
        },
        {
            key: 'amount',
            header: 'Amount',
        },
        {
            key: 'plan_validity',
            header: 'Validity',
        },
    ];

    if (canEditDataPlan) {
        columns.push({
            key: 'edit',
            header: 'Edit',
            className: 'w-[80px]',
            render: (row) => (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditFormModal({ show: true, id: row.id });
                    }}
                >
                    <Edit className="h-4 w-4" />
                </Button>
            ),
        });
    }

    if (canDeleteDataPlan) {
        columns.push({
            key: 'delete',
            header: 'Delete',
            className: 'w-[80px]',
            render: (row) => (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteModal({ show: true, id: row.id });
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            ),
        });
    }

    return columns;
}
