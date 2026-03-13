import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/data-table';
import { memo, useState } from 'react';
import CableSubscriptionPlanForm from "./CableSubscriptionPlanForm";
import DeleteConfirmModal from "@/components/modals/delete-confirm-modal";
import CableSubscriptionPlanEditForm from "./CableSubscriptionPlanEditForm";
import { getCablePlanColumns } from "./CableSubscriptionPlanUtils";
import { Plus } from "lucide-react";

export interface CablePlanRow {
    id: string | number;
    [key: string]: unknown;
}

export interface CablePlansResponse {
    data: CablePlanRow[];
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

interface CablePlanTableProps {
    paginationModel: { page: number; pageSize: number };
    setPaginationModel: (val: { page: number; pageSize: number }) => void;
    data: CablePlansResponse;
}

function CablePlanTable({ paginationModel, setPaginationModel, data }: CablePlanTableProps) {
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: "" });
    const [editFormModal, setEditFormModal] = useState({ show: false, id: "" });

    const handleCloseDelete = () => {
        setDeleteModal({ show: false, id: "" });
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">Cable Plans</CardTitle>
                    <Button
                        className="flex shrink-0"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormModal(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Plan
                    </Button>
                </CardHeader>
                <CardContent>
                    <DataTable<CablePlanRow>
                        columns={getCablePlanColumns(setEditFormModal, setDeleteModal)}
                        data={data?.data ?? []}
                        meta={meta}
                        links={links}
                        onPageChange={handlePageChange}
                        isLoading={!data}
                        emptyMessage="No cable plans found"
                    />
                </CardContent>
            </Card>

            <CableSubscriptionPlanForm
                setFormModal={setFormModal}
                formModal={formModal}
            />
            <CableSubscriptionPlanEditForm
                setFormModal={setEditFormModal}
                formModal={editFormModal}
            />
            <DeleteConfirmModal
                open={deleteModal.show}
                onOpenChange={(open) => !open && handleCloseDelete()}
                id={deleteModal.id}
                routeName="cable_subscription_plans.destroy"
                routeParamKey="cable_subscription_plan"
                itemType="Cable Plan"
                onSuccess={handleCloseDelete}
            />
        </>
    );
}

export default memo(CablePlanTable);
