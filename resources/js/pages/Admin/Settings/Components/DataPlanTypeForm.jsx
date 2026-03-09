// Components ....
import Modal from "@/Components/Modal";
import DataPlanTypeField from "./DataPlanTypeField";

const DataPlanTypeForm = (props) => {
    const { setFormModal, formModal } = props;

    return (
        <Modal
            title="Add Data Type"
            show={formModal}
            handleClose={() => {
                setFormModal(false);
            }}
        >
            <DataPlanTypeField editData={""} handleClose={setFormModal} />
        </Modal>
    );
};

export default DataPlanTypeForm;
