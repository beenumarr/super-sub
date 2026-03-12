import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";
import Field from "./Fields";

interface EditData {
    id: number;
    name: string;
    service_charges?: Array<{
        id: number;
        package_name: string;
        active: number;
        amount: string;
    }>;
}

interface UpdateFormProps {
    setFormModal: (modal: { show: boolean; id: string | number }) => void;
    formModal: { show: boolean; id: string | number };
}

const UpdateForm = ({ setFormModal, formModal }: UpdateFormProps) => {
    const [editData, setEditData] = useState<EditData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadEditData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/admin/cable_tv_services/${formModal.id}`);
            const res = await response.json();
            setEditData(res);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (formModal.show && formModal.id) {
            loadEditData();
        }
    }, [formModal.id, formModal.show]);

    const handleClose = () => {
        setFormModal({ show: false, id: "" });
        setEditData(null);
    };

    return (
        <Dialog open={formModal.show} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cable TV Charges</DialogTitle>
                    <DialogDescription>Update service charges for cable TV providers</DialogDescription>
                </DialogHeader>
                {isLoading || !editData?.service_charges ? (
                    <div className="flex justify-center w-full p-10">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-600 dark:text-gray-400" />
                    </div>
                ) : (
                    <Field editData={editData} handleClose={handleClose} />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UpdateForm;
