// Components ....
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Field from "./Fields";

const DataTransactionUpdateForm = (props) => {
    const { setFormModal, formModal } = props;
    const [editData, setEditData] = useState("");

    const loadEditData = async () => {
        const response = await fetch(`/admin/mobile_networks/${formModal.id}`);

        const res = await response.json();

        setEditData(res);
    };

    useEffect(() => {
        loadEditData();
    }, [formModal.id]);

    const handleClose = () => {
        setFormModal({ show: false, id: "" });
        setEditData("");
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
                    <DialogTitle>Data and Aitime Services</DialogTitle>
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

export default DataTransactionUpdateForm;
