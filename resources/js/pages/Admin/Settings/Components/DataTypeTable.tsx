import { memo, useState, FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import DeleteConfirmModal from "@/components/modals/delete-confirm-modal";
import DataPlanTypeForm from "./DataPlanTypeForm";
import DataPlanTypeEditForm from "./DataPlanTypeEditForm";
import { getDataTypeColumns, type DataTypeRow } from "./DataTypeUtils";

interface DataTypeTableProps {
    data: DataTypeRow[];
    enable_add_datatype: boolean;
    filterValues?: any;
    setFilterValue?: (val: any) => void;
    planTypes?: any[];
    theme?: string;
}

interface FormModal {
    show: boolean;
    id: string | number;
}

const DataTypeTable: FC<DataTypeTableProps> = ({ data, enable_add_datatype }) => {
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState<FormModal>({ show: false, id: "" });
    const [editFormModal, setEditFormModal] = useState<FormModal>({ show: false, id: "" });

    const handleCloseDelete = () => {
        setDeleteModal({ show: false, id: "" });
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">Data Types</CardTitle>
                    {enable_add_datatype && (
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setFormModal(true);
                            }}
                        >
                            Add New Data Type
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <DataTable<DataTypeRow>
                        columns={getDataTypeColumns(setEditFormModal, setDeleteModal)}
                        data={data ?? []}
                        isLoading={!data}
                        emptyMessage="No data types found"
                    />
                </CardContent>
            </Card>

            <DataPlanTypeForm
                setFormModal={setFormModal}
                formModal={formModal}
            />
            <DataPlanTypeEditForm
                setFormModal={setEditFormModal}
                formModal={editFormModal}
            />
            <DeleteConfirmModal
                open={deleteModal.show}
                onOpenChange={(open) => !open && handleCloseDelete()}
                id={deleteModal.id}
                routeName="data_plan_types.destroy"
                routeParamKey="data_plan_type"
                itemType="Data Type"
                onSuccess={handleCloseDelete}
            />
        </>
    );
};

export default memo(DataTypeTable);
