import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import SiteLogoFormField from './SiteLogoFormField';

interface SiteLogoFormProps {
    setFormModal: (value: boolean) => void;
    formModal: boolean;
    reloadPage: () => void;
}

export default function SiteLogoForm({ setFormModal, formModal, reloadPage }: SiteLogoFormProps) {
    return (
        <Dialog open={formModal} onOpenChange={setFormModal}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update Site Logo</DialogTitle>
                </DialogHeader>
                <SiteLogoFormField reloadPage={reloadPage} handleClose={() => setFormModal(false)} />
            </DialogContent>
        </Dialog>
    );
}
