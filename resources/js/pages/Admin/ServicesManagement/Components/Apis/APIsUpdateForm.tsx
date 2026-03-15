// Components ....
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Field, { type TransactionApiEditData } from "./Fields";

interface EditFormModalState {
    show: boolean;
    id: number | null;
}

interface APIsUpdateFormProps {
    setFormModal: (state: EditFormModalState) => void;
    formModal: EditFormModalState;
}

const APIsUpdateForm = ({ setFormModal, formModal }: APIsUpdateFormProps) => {
    const [editData, setEditData] = useState<TransactionApiEditData | null>(null);

    const loadEditData = async () => {
        if (!formModal.id) return;

        const response = await fetch(`/admin/transaction_apis/${formModal.id}`);
        const res = (await response.json()) as TransactionApiEditData;

        setEditData(res);
    };

    useEffect(() => {
        if (formModal.show && formModal.id) {
            void loadEditData();
        }
    }, [formModal.id, formModal.show]);

    const handleClose = () => {
        setFormModal({ show: false, id: null });
        setEditData(null);
    };

    return (
        <Dialog
            open={formModal.show}
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Vending Medium Api</DialogTitle>
                </DialogHeader>
                {editData ? (
                    <Field editData={editData} handleClose={handleClose} />
                ) : (
                    <div className="flex justify-center w-full p-10">
                        <span
                            className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
                            aria-label="Loading"
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default APIsUpdateForm;

