import DeleteConfirmModal from '@/components/modals/delete-confirm-modal';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { Plus, RefreshCw } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import DataPlanEditForm from './DataPlanEditForm';
import DataPlanForm from './DataPlanForm';
import type { DataPlanRow } from './DataPlanUtils';
import { getDataPlanColumns } from './DataPlanUtils';

interface PlanType {
    id: string | number;
    name: string;
}

interface DataTypeOption {
    id: string | number;
    name: string;
    network?: { name: string };
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
    dataTypes: DataTypeOption[];
    filterValues: FilterValues;
    setFilterValue: (val: FilterValues) => void;
    canCreateDataPlan?: boolean;
    canEditDataPlan?: boolean;
    canDeleteDataPlan?: boolean;
}

type BulkAction = 'enable' | 'disable' | 'delete' | 'move_category';

function PlanTypeOption({ data, onClick, value }: { data: { name: string; id: string | number }; onClick: () => void; value: string | number }) {
    const isSelected = value === data.id;
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-md px-4 py-2 text-center text-sm font-medium transition-colors ${
                isSelected ? 'bg-muted text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
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
    dataTypes,
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
    const [selectedPlanIds, setSelectedPlanIds] = useState<Array<string | number>>([]);
    const [bulkAction, setBulkAction] = useState<BulkAction | ''>('');
    const [targetCategoryId, setTargetCategoryId] = useState<string>('');
    const [bulkConfirmModalOpen, setBulkConfirmModalOpen] = useState(false);
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

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
    const currentRows = useMemo(() => data?.data ?? [], [data?.data]);
    const availableCategories = useMemo(() => {
        return (dataTypes ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            networkName: item.network?.name ?? '',
        }));
    }, [dataTypes]);

    const selectableIds = useMemo(() => currentRows.map((row) => row.id), [currentRows]);
    const selectedIdSet = useMemo(() => new Set(selectedPlanIds.map((id) => String(id))), [selectedPlanIds]);
    const selectedCount = selectedPlanIds.length;
    const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIdSet.has(String(id)));
    const partiallySelected = !allSelected && selectableIds.some((id) => selectedIdSet.has(String(id)));
    const canApplyBulkAction =
        selectedCount > 0 && bulkAction !== '' && (bulkAction !== 'move_category' || targetCategoryId !== '') && !isBulkSubmitting;

    useEffect(() => {
        const nextSelectable = new Set(selectableIds.map((id) => String(id)));
        setSelectedPlanIds((prev) => prev.filter((id) => nextSelectable.has(String(id))));
    }, [selectableIds]);

    const toggleSelectPlan = useCallback((id: string | number) => {
        setSelectedPlanIds((prev) =>
            prev.some((item) => String(item) === String(id)) ? prev.filter((item) => String(item) !== String(id)) : [...prev, id],
        );
    }, []);

    const toggleSelectAll = useCallback(() => {
        if (allSelected) {
            setSelectedPlanIds((prev) => prev.filter((id) => !selectableIds.some((rowId) => String(rowId) === String(id))));
            return;
        }

        const incoming = selectableIds.filter((id) => !selectedIdSet.has(String(id)));
        setSelectedPlanIds((prev) => [...prev, ...incoming]);
    }, [allSelected, selectableIds, selectedIdSet]);

    const bulkEnabled = canEditDataPlan || canDeleteDataPlan;
    const bulkActions = useMemo(
        () =>
            [
                canEditDataPlan && { value: 'enable' as const, label: 'Enable' },
                canEditDataPlan && { value: 'disable' as const, label: 'Disable' },
                canDeleteDataPlan && { value: 'delete' as const, label: 'Delete' },
                canEditDataPlan && { value: 'move_category' as const, label: 'Move to Category' },
            ].filter(Boolean) as { value: BulkAction; label: string }[],
        [canDeleteDataPlan, canEditDataPlan],
    );

    const tableColumns = useMemo(
        () => [
            {
                key: 'bulk_select',
                header: (
                    <Checkbox
                        aria-label="Select all plans on page"
                        checked={allSelected ? true : partiallySelected ? 'indeterminate' : false}
                        onCheckedChange={toggleSelectAll}
                    />
                ),
                className: 'w-[48px]',
                render: (row: DataPlanRow) => (
                    <Checkbox
                        aria-label={`Select plan ${row.name}`}
                        checked={selectedIdSet.has(String(row.id))}
                        onCheckedChange={() => toggleSelectPlan(row.id)}
                    />
                ),
            },
            ...getDataPlanColumns(setEditFormModal, setDeleteModal, canEditDataPlan, canDeleteDataPlan),
        ],
        [allSelected, partiallySelected, selectedIdSet, canEditDataPlan, canDeleteDataPlan, toggleSelectAll, toggleSelectPlan],
    );

    const handleRunBulkAction = () => {
        if (!canApplyBulkAction) return;

        setIsBulkSubmitting(true);
        try {
            router.post(
                '/admin/data_plans/bulk-action',
                {
                    ids: selectedPlanIds,
                    action: bulkAction,
                    data_plan_type_id: bulkAction === 'move_category' ? Number(targetCategoryId) : undefined,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Bulk action completed successfully');
                        setBulkConfirmModalOpen(false);
                        setSelectedPlanIds([]);
                        setBulkAction('');
                        setTargetCategoryId('');
                    },
                    onError: (errors) => {
                        const firstError = Object.values(errors ?? {})[0];
                        const message = Array.isArray(firstError) ? firstError[0] : firstError;
                        toast.error(typeof message === 'string' ? message : 'Failed to run bulk action');
                    },
                    onFinish: () => setIsBulkSubmitting(false),
                },
            );
        } catch {
            setIsBulkSubmitting(false);
            toast.error('Unable to process bulk action right now');
        }
    };

    return (
        <>
            <Card className="border-none p-0 shadow-none">
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 pb-4">
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                        {planTypes.length > 0 && (
                            <>
                                <PlanTypeOption
                                    data={{ name: 'ALL', id: '' }}
                                    value={filterValues.planType}
                                    onClick={() => setFilterValue({ ...filterValues, planType: '' })}
                                />
                                {planTypes.map((type) => (
                                    <PlanTypeOption
                                        key={String(type.id)}
                                        data={type}
                                        value={filterValues.planType}
                                        onClick={() => setFilterValue({ ...filterValues, planType: type.id })}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                    <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
                        {bulkEnabled && (
                            <>
                                <Select
                                    value={bulkAction || undefined}
                                    onValueChange={(value) => {
                                        const nextAction = value as BulkAction;
                                        setBulkAction(nextAction);
                                        if (nextAction !== 'move_category') {
                                            setTargetCategoryId('');
                                        }
                                        if (selectedCount > 0) {
                                            setBulkConfirmModalOpen(true);
                                        } else {
                                            toast.error('Select at least one data plan first');
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Bulk action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bulkActions.map((actionItem) => (
                                            <SelectItem key={actionItem.value} value={actionItem.value}>
                                                {actionItem.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        )}

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
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable<DataPlanRow>
                        columns={tableColumns}
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
                            <strong>Read-only mode:</strong> You have view-only access to data plans. Contact an administrator if you need to create,
                            edit, or delete data plans.
                        </p>
                    </div>
                </div>
            )}

            <DataPlanForm setFormModal={setFormModal} formModal={formModal} />
            <DataPlanEditForm setFormModal={setEditFormModal} formModal={editFormModal} />
            <Dialog open={bulkConfirmModalOpen} onOpenChange={setBulkConfirmModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {bulkAction === 'delete'
                                ? 'Delete Selected Data Plans'
                                : bulkAction === 'move_category'
                                  ? 'Move Selected Data Plans'
                                  : 'Confirm Bulk Action'}
                        </DialogTitle>
                        <DialogDescription>
                            {bulkAction === 'enable' && `Enable ${selectedCount} selected data plan(s).`}
                            {bulkAction === 'disable' && `Disable ${selectedCount} selected data plan(s).`}
                            {bulkAction === 'delete' &&
                                `This will permanently delete ${selectedCount} selected data plan(s). This action cannot be undone.`}
                            {bulkAction === 'move_category' && `Choose the category for ${selectedCount} selected data plan(s).`}
                        </DialogDescription>
                    </DialogHeader>

                    {bulkAction === 'move_category' && (
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Category</div>
                            <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCategories.map((category) => (
                                        <SelectItem key={String(category.id)} value={String(category.id)}>
                                            {category.networkName ? `${category.name} (${category.networkName})` : category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <DialogFooter className="flex space-x-2 sm:justify-end">
                        <Button type="button" variant="outline" onClick={() => setBulkConfirmModalOpen(false)} disabled={isBulkSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant={bulkAction === 'delete' ? 'destructive' : 'default'}
                            onClick={handleRunBulkAction}
                            disabled={!canApplyBulkAction}
                        >
                            {isBulkSubmitting ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Applying...
                                </>
                            ) : bulkAction === 'delete' ? (
                                'Delete Selected'
                            ) : (
                                'Confirm Action'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
