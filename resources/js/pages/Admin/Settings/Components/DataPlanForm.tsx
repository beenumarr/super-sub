import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import DataPlanField from './DataPlanField';

interface DataPlanFormProps {
    setFormModal: (value: boolean) => void;
    formModal: boolean;
}

export default function DataPlanForm({ setFormModal, formModal }: DataPlanFormProps) {
    return (
        <Dialog open={formModal} onOpenChange={setFormModal}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Data Plan</DialogTitle>
                </DialogHeader>
                <DataPlanField editData={null} handleClose={() => setFormModal(false)} />
            </DialogContent>
        </Dialog>
    );
}
