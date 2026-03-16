import { FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DataPlanTypeField from "./DataPlanTypeField";

interface DataPlanTypeFormProps {
    setFormModal: (val: boolean) => void;
    formModal: boolean;
}

const DataPlanTypeForm: FC<DataPlanTypeFormProps> = ({ setFormModal, formModal }) => {
    return (
        <Dialog open={formModal} onOpenChange={setFormModal}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Data Type</DialogTitle>
                </DialogHeader>
                <DataPlanTypeField editData={""} handleClose={setFormModal} />
            </DialogContent>
        </Dialog>
    );
};

export default DataPlanTypeForm;
