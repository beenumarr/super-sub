// Components ....
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddFormFields from "./AddFormFields";

interface APIFormProps {
    setFormModal: (open: boolean) => void;
    formModal: boolean;
}

const APIForm = ({ setFormModal, formModal }: APIFormProps) => {
    const handleClose = () => {
        setFormModal(false);
    };

    return (
        <Dialog
            open={formModal}
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                } else {
                    setFormModal(true);
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Vending Medium Api</DialogTitle>
                </DialogHeader>
                <AddFormFields handleClose={handleClose} />
            </DialogContent>
        </Dialog>
    );
};

export default APIForm;

