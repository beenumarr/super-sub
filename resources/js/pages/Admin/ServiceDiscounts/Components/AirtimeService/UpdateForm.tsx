import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Field from './Fields';

interface EditData {
    id: number;
    name: string;
    service_discounts: ServiceDiscount[];
}

interface ServiceDiscount {
    id: number;
    package_name: string;
    amount: number;
    active: number;
}

interface UpdateFormProps {
    setFormModal: (value: { show: boolean; id: string }) => void;
    formModal: { show: boolean; id: string };
}

const UpdateForm = ({ setFormModal, formModal }: UpdateFormProps) => {
    const [editData, setEditData] = useState<EditData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadEditData = async () => {
        if (!formModal.id) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/admin/mobile_networks/${formModal.id}`);
            const res = await response.json();
            setEditData(res);
        } catch (error) {
            console.error('Failed to load edit data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (formModal.show) {
            loadEditData();
        }
    }, [formModal.id, formModal.show]);

    const handleClose = () => {
        setFormModal({ show: false, id: '' });
        setEditData(null);
    };

    return (
        <Dialog open={formModal.show} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Airtime Discount Settings</DialogTitle>
                    <DialogDescription>
                        {editData?.name && `Manage discount for ${editData.name}`}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-500 dark:text-gray-400" />
                    </div>
                ) : editData ? (
                    <Field editData={editData} handleClose={handleClose} />
                ) : null}
            </DialogContent>
        </Dialog>
    );
};

export default UpdateForm;
