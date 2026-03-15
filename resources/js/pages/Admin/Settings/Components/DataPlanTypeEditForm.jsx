// Components ....
import Modal from "@/Components/Modal";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import DataPlanTypeField from "./DataPlanTypeField";

const DataPlanTypeEditForm = (props) => {
    const { setFormModal, formModal } = props;
    const [editData, setEditData] = useState("");

    const loadEditData = async () => {
        const response = await fetch(`/admin/data_plan_types/${formModal.id}`);

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
            title="Edit Data Plan"
            show={formModal.show}
            handleClose={handleClose}
        >
            {editData ? (
                <DataPlanTypeField
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

export default DataPlanTypeEditForm;
