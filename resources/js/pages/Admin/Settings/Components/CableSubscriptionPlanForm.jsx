// Components ....
import Modal from "@/Components/Modal";
import CableSubscriptionPlanField from "./CableSubscriptionPlanField";

const CableSubscriptionPlanForm = (props) => {
    const { setFormModal, formModal } = props;

    return (
        <Modal
            title="Add Cable Plan"
            show={formModal}
            handleClose={() => {
                setFormModal(false);
            }}
        >
            <CableSubscriptionPlanField
                editData={""}
                handleClose={setFormModal}
            />
        </Modal>
    );
};

export default CableSubscriptionPlanForm;
