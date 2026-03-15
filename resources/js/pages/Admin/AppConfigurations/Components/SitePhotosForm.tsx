import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import SitePhotosFormField from './SitePhotosFormField';

interface SitePhotosFormProps {
    setFormModal: (value: boolean) => void;
    formModal: boolean;
    reloadPage: () => void;
}

export default function SitePhotosForm({ setFormModal, formModal, reloadPage }: SitePhotosFormProps) {
    return (
        <Dialog open={formModal} onOpenChange={setFormModal}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update Landing Page Photos</DialogTitle>
                </DialogHeader>
                <SitePhotosFormField
                    reloadPage={reloadPage}
                    handleClose={() => setFormModal(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
