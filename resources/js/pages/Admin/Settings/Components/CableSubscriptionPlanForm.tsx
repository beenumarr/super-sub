// Components ....
import Modal from "@/Components/Modal";
import CableSubscriptionPlanField from "./CableSubscriptionPlanField";

interface CableSubscriptionPlanFormProps {
    setFormModal: (value: boolean) => void;
    formModal: boolean;
}

const CableSubscriptionPlanForm = ({ setFormModal, formModal }: CableSubscriptionPlanFormProps) => {
    const handleClose = () => setFormModal(false);

    return (
        <Modal
            title="Add Cable Plan"
            show={formModal}
            handleClose={handleClose}
        >
            <CableSubscriptionPlanField
                editData={null}
                handleClose={handleClose}
            />
        </Modal>
    );
};

export default CableSubscriptionPlanForm;
