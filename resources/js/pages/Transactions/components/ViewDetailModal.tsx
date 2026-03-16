import { useEffect, useState, FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UpdateTransactionForm from './UpdateTransactionForm';

interface EditData {
    id: number;
    amount: string | number;
    description: string;
    status: string;
    api_response: string;
    balance_before?: string | number;
    balance_after?: string | number;
    reference: string;
    date?: string;
    transactionable?: {
        token?: string;
    };
}

interface ViewDetailModalItem {
    show: boolean;
    id: string | number;
}

interface ViewDetailModalProps {
    setViewDetailModal: (val: ViewDetailModalItem) => void;
    viewDetailModal: ViewDetailModalItem;
}

const ViewDetailModal: FC<ViewDetailModalProps> = ({ setViewDetailModal, viewDetailModal }) => {
    const [editData, setEditData] = useState<EditData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadEditData = async () => {
        setIsLoading(true);
        setEditData(null);
        try {
            const response = await fetch(`/transactions/${viewDetailModal.id}`);
            const res: EditData = await response.json();
            setEditData(res);
        } catch (error) {
            console.error('Failed to load transaction details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (viewDetailModal.show && viewDetailModal.id) {
            loadEditData();
        }
    }, [viewDetailModal.id, viewDetailModal.show]);

    const handleClose = () => {
        setViewDetailModal({ show: false, id: '' });
        setEditData(null);
    };

    return (
        <Dialog open={viewDetailModal.show} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Transaction Details</DialogTitle>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    </div>
                ) : editData ? (
                    <UpdateTransactionForm editData={editData} />
                ) : (
                    <div className="py-8 text-center text-gray-500">Failed to load transaction details</div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ViewDetailModal;
