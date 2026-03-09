// Components ....
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CableTvServieFields from "./CableTvServieFields";
import BillPaymentServiceFields from "./BillPaymentServiceFields";
import WalletFundingServiceFields from "./WalletFundingServiceFields";
import UserPackageForm from "./UserPackageForm";
import ResultCheckerServieFields from "./ResultCheckerServieFields";
import AirtimeToCashServieFields from "./AirtimeToCashServieFields";

interface UtilityFormModalState {
    show: boolean;
    id: string | number;
    form?: string;
}

interface UtilityServicesUpdateFormProps {
    setFormModal: (state: UtilityFormModalState) => void;
    formModal: UtilityFormModalState;
}

const UtilityServicesUpdateForm = ({ setFormModal, formModal }: UtilityServicesUpdateFormProps) => {
    // backend shape varies per form (arrays of services, user_packages, etc.)
    const [editData, setEditData] = useState<any>(null);

    const loadEditData = async () => {
        if (!formModal.form) return;

        const response = await fetch(`/admin/${formModal.form}`);
        const res = await response.json();

        setEditData(res);
    };

    useEffect(() => {
        if (!formModal.show || !formModal.form) return;
        void loadEditData();
    }, [formModal.show, formModal.form]);

    const handleClose = () => {
        setFormModal({ show: false, id: "", form: formModal.form });
        setEditData(null);
    };

    const title =
        formModal.form === "cable_tv_services"
            ? "Cable Tv Service"
            : formModal.form === "result_checker_service"
            ? "Result Checker Service"
            : formModal.form === "bill_payment_services"
            ? "Bill Payment Service"
            : formModal.form === "wallet_funding_services"
            ? "Wallet Funding Service"
            : formModal.form === "airtime_to_cash_services"
            ? "Airtime to Cash Service"
            : "Service Management";

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
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {editData ? (
                    formModal.form === "cable_tv_services" ? (
                        <CableTvServieFields
                            editData={editData}
                            handleClose={handleClose}
                        />
                    ) : formModal.form === "result_checker_services" ? (
                        <ResultCheckerServieFields
                            editData={editData}
                            handleClose={handleClose}
                        />
                    ) : formModal.form === "bill_payment_services" ? (
                        <BillPaymentServiceFields
                            editData={editData}
                            handleClose={handleClose}
                        />
                    ) : formModal.form === "airtime_to_cash_services" ? (
                        <AirtimeToCashServieFields
                            editData={editData}
                            handleClose={handleClose}
                        />
                    ) : formModal.form === "wallet_funding_services" ? (
                        <WalletFundingServiceFields
                            editData={editData}
                            handleClose={handleClose}
                        />
                    ) : (
                        formModal.form === "user_packages" && (
                            <UserPackageForm
                                editData={editData}
                                handleClose={handleClose}
                            />
                        )
                    )
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

export default UtilityServicesUpdateForm;

