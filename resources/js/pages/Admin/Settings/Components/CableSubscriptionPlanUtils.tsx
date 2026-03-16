import { Button } from '@/components/ui/button';
import type { DataTableColumn } from '@/components/shared/data-table';
import { Pencil, Trash2 } from 'lucide-react';
import type { CablePlanRow } from './CableSubscriptionPlanTable';

type ModalState = { show: boolean; id: string | number };

export function getCablePlanColumns(
    setEditFormModal: (state: ModalState) => void,
    setDeleteModal: (state: ModalState) => void,
): DataTableColumn<CablePlanRow>[] {
    return [
        {
            key: 'package_name',
            header: 'Package Name',
            className: 'min-w-[180px]',
        },
        {
            key: 'cable_name',
            header: 'Cable Name',
            className: 'min-w-[140px]',
        },
        {
            key: 'product_code',
            header: 'Product Code',
            className: 'min-w-[140px]',
        },
        {
            key: 'amount',
            header: 'Amount',
            className: 'min-w-[120px]',
        },
        {
            key: 'validity',
            header: 'Validity',
            className: 'min-w-[120px]',
        },
        {
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
                    <Pencil className="h-4 w-4" />
                </Button>
            ),
        },
        {
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
        },
    ];
}
