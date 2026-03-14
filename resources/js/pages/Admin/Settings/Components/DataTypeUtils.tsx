import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { DataTableColumn } from '@/components/shared/data-table';
import { Edit2, Trash2 } from 'lucide-react';

export interface DataTypeRow {
    id: number;
    name: string;
    network: {
        name: string;
    };
    active: boolean;
    [key: string]: unknown;
}

type ModalState = { show: boolean; id: string | number };

export function getDataTypeColumns(
    setEditFormModal: (state: ModalState) => void,
    setDeleteModal: (state: ModalState) => void,
): DataTableColumn<DataTypeRow>[] {
    return [
        {
            key: 'name',
            header: 'Name',
            className: 'min-w-[180px]',
        },
        {
            key: 'network',
            header: 'Network',
            className: 'min-w-[120px]',
            render: (row) => <span className="uppercase text-sm">{row.network?.name ?? 'N/A'}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            className: 'min-w-[120px]',
            render: (row) => (
                <Badge className={row.active ? 'bg-green-600' : 'bg-gray-500'}>
                    {row.active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            className: 'w-[160px]',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <Switch
                        checked={Boolean(row.active)}
                        onCheckedChange={async (checked) => {
                            try {
                                const token = document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') || '';

                                const res = await fetch(`/admin/data_plan_types/${row.id}/toggle`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRF-TOKEN': token,
                                    },
                                    body: JSON.stringify({ active: checked ? 1 : 0 }),
                                });

                                if (res.ok) {
                                    // reload to refresh the table state
                                    window.location.reload();
                                } else {
                                    console.error('Failed to toggle data type status');
                                }
                            } catch (err) {
                                console.error('Error toggling data type status', err);
                            }
                        }}
                        className="mr-2"
                    />
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditFormModal({ show: true, id: row.id });
                        }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteModal({ show: true, id: row.id });
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];
}
