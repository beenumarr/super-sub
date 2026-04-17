import { FC, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DataPlanTypeField from "./DataPlanTypeField";

interface FormModal {
    show: boolean;
    id: string | number;
}

interface DataPlanTypeEditFormProps {
    setFormModal: (val: FormModal) => void;
    formModal: FormModal;
}

interface EditData {
    id: number;
    name: string;
    network_id?: number;
    mobile_network_id?: number;
    code?: string;
    transaction_api_id?: number;
    active: boolean;
}

const DataPlanTypeEditForm: FC<DataPlanTypeEditFormProps> = ({ setFormModal, formModal }) => {
    const [editData, setEditData] = useState<EditData | null>(null);

    const loadEditData = async () => {
        try {
            const response = await fetch(`/admin/data_plan_types/${formModal.id}`);
            const res = await response.json();
            setEditData(res);
        } catch (error) {
            console.error("Failed to load data type:", error);
        }
    };

    useEffect(() => {
        if (formModal.show && formModal.id) {
            loadEditData();
        }
    }, [formModal.id, formModal.show]);

    const handleClose = (open: boolean) => {
        if (!open) {
            setFormModal({ show: false, id: "" });
            setEditData(null);
        }
    };

    return (
        <Dialog open={formModal.show} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Data Type</DialogTitle>
                </DialogHeader>
                {editData ? (
                    <DataPlanTypeField
                        editData={editData}
                        handleClose={handleClose}
                    />
                ) : (
                    <div className="flex justify-center w-full p-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DataPlanTypeEditForm;
