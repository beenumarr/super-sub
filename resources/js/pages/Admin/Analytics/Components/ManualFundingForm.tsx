import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import DataPlanField from "./DataPlanField";

interface ManualFundingFormProps {
    setFormModal: (value: boolean) => void;
    formModal: boolean;
}

const ManualFundingForm = ({
    setFormModal,
    formModal,
}: ManualFundingFormProps) => {
    return (
        <Dialog open={formModal} onOpenChange={setFormModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Fund / Debit User</DialogTitle>
                </DialogHeader>
                <DataPlanField setFormModal={setFormModal} />
            </DialogContent>
        </Dialog>
    );
};

export default ManualFundingForm;
