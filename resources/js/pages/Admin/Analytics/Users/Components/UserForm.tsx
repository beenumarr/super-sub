import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import UserField from "./UserField";

interface UserFormProps {
    setFormModal: (value: boolean) => void;
    formModal: boolean;
}

const UserForm = ({ setFormModal, formModal }: UserFormProps) => {
    return (
        <Dialog open={formModal} onOpenChange={setFormModal}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <UserField editData="" handleClose={setFormModal} />
            </DialogContent>
        </Dialog>
    );
};

export default UserForm;
