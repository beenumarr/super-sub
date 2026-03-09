// Components ....
import Modal from "@/Components/Modal";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import CableSubscriptionPlanField from "./CableSubscriptionPlanField";

const CableSubscriptionPlanEditForm = (props) => {
    const { setFormModal, formModal } = props;
    const [editData, setEditData] = useState("");

    const loadEditData = async () => {
        const response = await fetch(
            `/admin/cable_subscription_plans/${formModal.id}`
        );

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
