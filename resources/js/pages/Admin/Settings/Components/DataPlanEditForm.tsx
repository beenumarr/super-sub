import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import DataPlanField from './DataPlanField';

interface EditFormModalState {
    show: boolean;
    id: string | number;
}

interface DataPlanEditFormProps {
    setFormModal: (state: EditFormModalState) => void;
    formModal: EditFormModalState;
}

interface EditData {
    id: number;
    network_id?: string | number;
    plan_size?: string | number;
    name?: string;
    plan_volume?: string;
    plan_validity?: string | number;
    amount?: string | number;
    api_plan_id?: string;
    data_plan_type_id?: string | number;
    api_ids?: { transaction_api_id: number; product_id?: string; product_code?: string }[];
    active?: boolean;
    enable_custom_vending_api?: boolean;
    custom_api_vending_id?: string;
    [key: string]: unknown;
}

export default function DataPlanEditForm({ setFormModal, formModal }: DataPlanEditFormProps) {
    const [editData, setEditData] = useState<EditData | null>(null);

    const loadEditData = async () => {
        const response = await fetch(`/admin/data_plans/${formModal.id}`);
        const res = await response.json();
        setEditData(res);
    };

    useEffect(() => {
        if (formModal.id) {
            loadEditData();
        }
    }, [formModal.id]);

    const handleClose = () => {
        setFormModal({ show: false, id: '' });
        setEditData(null);
    };

    return (
        <Dialog open={formModal.show} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Data Plan</DialogTitle>
                </DialogHeader>
                {editData ? (
                    <DataPlanField editData={editData} handleClose={handleClose} />
                ) : (
                    <div className="flex w-full justify-center py-10">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-1 border-t-transparent" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
