import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SiteFaviconFormField from './SiteFaviconFormField';

interface SiteFaviconFormProps {
    setFormModal: (value: boolean) => void;
    formModal: boolean;
    reloadPage: () => void;
}

export default function SiteFaviconForm({ setFormModal, formModal, reloadPage }: SiteFaviconFormProps) {
    return (
        <Dialog open={formModal} onOpenChange={setFormModal}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update Favicon</DialogTitle>
                </DialogHeader>
                <SiteFaviconFormField reloadPage={reloadPage} handleClose={() => setFormModal(false)} />
            </DialogContent>
        </Dialog>
    );
}

