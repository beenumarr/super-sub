import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import UserField from "./UserField";
import UserPasswordField from "./UserPasswordField";

interface UserEditFormProps {
    setFormModal: (value: any) => void;
    formModal: {
        show: boolean;
        id: string;
        password_update: boolean;
    };
}

const UserEditForm = ({ setFormModal, formModal }: UserEditFormProps) => {
    const [editData, setEditData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const loadEditData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/admin/users/${formModal.id}`);
            const res = await response.json();
            setEditData(res);
        } catch (error) {
            console.error("Error loading user data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (formModal.show && formModal.id) {
            loadEditData();
        }
    }, [formModal?.id, formModal.show]);

    const handleClose = () => {
        setFormModal({ show: false, id: "", password_update: false });
        setEditData(null);
    };

    return (
        <Dialog open={formModal.show} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>
                {loading ? (
                    <div className="flex justify-center w-full p-10">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500 dark:text-blue-400" />
                    </div>
                ) : editData && !formModal.password_update ? (
                    <UserField editData={editData} handleClose={handleClose} />
                ) : editData && formModal.password_update ? (
                    <UserPasswordField
                        editData={editData}
                        handleClose={handleClose}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
};

export default UserEditForm;
