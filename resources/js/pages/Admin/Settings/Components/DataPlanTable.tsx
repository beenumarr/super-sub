import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeleteConfirmModal from '@/components/modals/delete-confirm-modal';
import { DataTable } from '@/components/shared/data-table';
import type { DataPlanRow } from './DataPlanUtils';
import { getDataPlanColumns } from './DataPlanUtils';
import { memo, useState } from 'react';
import DataPlanForm from './DataPlanForm';
import DataPlanEditForm from './DataPlanEditForm';
import { Plus } from 'lucide-react';

interface PlanType {
    id: string | number;
    name: string;
}

interface FilterValues {
    page: number;
    pageSize: number;
    network: string | number;
    planType: string | number;
}

interface DataPlansResponse {
    data: DataPlanRow[];
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
        links?: { url: string | null; label: string; active: boolean }[];
    };
    links?: { first: string; last: string; prev: string | null; next: string | null };
}

interface DataPlanTableProps {
    paginationModel: { page: number; pageSize: number };
    setPaginationModel: (val: { page: number; pageSize: number }) => void;
    data: DataPlansResponse;
    theme?: string;
    planTypes: PlanType[];
    filterValues: FilterValues;
    setFilterValue: (val: FilterValues) => void;
    canCreateDataPlan?: boolean;
    canEditDataPlan?: boolean;
    canDeleteDataPlan?: boolean;
}

function PlanTypeOption({
    data,
    onClick,
    value,
}: {
    data: { name: string; id: string | number };
    onClick: () => void;
    value: string | number;
}) {
    const isSelected = value === data.id;
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-md px-4 py-2 text-center text-sm font-medium transition-colors ${
                isSelected
                    ? 'bg-muted text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
            }`}
        >
            <span className="capitalize">{data.name}</span>
        </button>
    );
}

function DataPlanTable({
    paginationModel,
    setPaginationModel,
    data,
    planTypes,
    filterValues,
    setFilterValue,
    canCreateDataPlan = false,
    canEditDataPlan = false,
    canDeleteDataPlan = false,
}: DataPlanTableProps) {
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | number }>({
        show: false,
        id: '',
    });
    const [editFormModal, setEditFormModal] = useState<{ show: boolean; id: string | number }>({
        show: false,
        id: '',
    });

    const handleCloseDelete = () => {
        setDeleteModal({ show: false, id: '' });
    };

    const handlePageChange = (page: number) => {
        setPaginationModel({ page: page - 1, pageSize: paginationModel.pageSize });
    };

    const meta = data?.meta;
    const links = data?.links ?? {
        first: '',
        last: '',
        prev: null,
        next: null,
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 pb-4">
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                        {planTypes.length > 0 && (
                            <>
                                <PlanTypeOption
                                    data={{ name: 'ALL', id: '' }}
                                    value={filterValues.planType}
                                    onClick={() =>
                                        setFilterValue({ ...filterValues, planType: '' })
                                    }
                                />
                                {planTypes.map((type) => (
                                    <PlanTypeOption
                                        key={String(type.id)}
                                        data={type}
                                        value={filterValues.planType}
                                        onClick={() =>
                                            setFilterValue({ ...filterValues, planType: type.id })
                                        }
                                    />
                                ))}
                            </>
                        )}
                    </div>
                    {canCreateDataPlan && (
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setFormModal(true);
                            }}
                            className="shrink-0"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Plan
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <DataTable<DataPlanRow>
                        columns={getDataPlanColumns(
                            setEditFormModal,
                            setDeleteModal,
                            canEditDataPlan,
                            canDeleteDataPlan,
                        )}
                        data={data?.data ?? []}
                        meta={meta}
                        links={links}
                        onPageChange={handlePageChange}
                        isLoading={!data}
                        emptyMessage="No data plans found"
                    />
                </CardContent>
            </Card>

            {!canCreateDataPlan && !canEditDataPlan && !canDeleteDataPlan && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                            <span className="text-amber-600 dark:text-amber-400">!</span>
                        </div>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>Read-only mode:</strong> You have view-only access to data plans.
                            Contact an administrator if you need to create, edit, or delete data
                            plans.
                        </p>
                    </div>
                </div>
            )}

            <DataPlanForm setFormModal={setFormModal} formModal={formModal} />
            <DataPlanEditForm setFormModal={setEditFormModal} formModal={editFormModal} />
            <DeleteConfirmModal
                open={deleteModal.show}
                onOpenChange={(open) => !open && handleCloseDelete()}
                id={deleteModal.id}
                routeName="data_plans.destroy"
                routeParamKey="data_plan"
                itemType="Data Plan"
                onSuccess={handleCloseDelete}
            />
        </>
    );
}

export default memo(DataPlanTable);
