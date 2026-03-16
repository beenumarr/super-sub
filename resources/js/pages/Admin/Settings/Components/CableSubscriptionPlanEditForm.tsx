// Components ....
import Modal from "@/Components/Modal";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import CableSubscriptionPlanField from "./CableSubscriptionPlanField";

interface EditFormModalState {
    show: boolean;
    id: string | number;
}

type CablePlan = Record<string, unknown>;

interface CableSubscriptionPlanEditFormProps {
    setFormModal: (state: EditFormModalState) => void;
    formModal: EditFormModalState;
}

const CableSubscriptionPlanEditForm = ({
    setFormModal,
    formModal,
}: CableSubscriptionPlanEditFormProps) => {
    const [editData, setEditData] = useState<CablePlan | null>(null);

    const loadEditData = async () => {
        if (!formModal.id) return;
        const response = await fetch(
            `/admin/cable_subscription_plans/${formModal.id}`
        );

        const res = await response.json();

        setEditData(res);
    };

    useEffect(() => {
        if (formModal.show) {
            loadEditData();
        }
    }, [formModal.id, formModal.show]);

    const handleClose = () => {
        setFormModal({ show: false, id: "" });
        setEditData(null);
    };

    return (
        <Modal
            title="Edit Cable Plan"
            show={formModal.show}
            handleClose={handleClose}
        >
            {editData ? (
                <CableSubscriptionPlanField
                    editData={editData}
                    handleClose={handleClose}
                />
            ) : (
                <div className="flex justify-center w-full p-10">
                    <CircularProgress color="inherit" size={20} />
                </div>
            )}
        </Modal>
    );
};

export default CableSubscriptionPlanEditForm;
