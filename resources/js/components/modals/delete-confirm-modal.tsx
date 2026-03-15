import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface DeleteConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    id: string | number | null;
    routeName: string;
    routeParamKey?: string;
    itemType?: string;
    onSuccess?: () => void;
}

export default function DeleteConfirmModal({
    open,
    onOpenChange,
    id,
    routeName,
    routeParamKey = 'data_plan',
    itemType = 'item',
    onSuccess,
}: DeleteConfirmModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (id == null) return;
        setIsDeleting(true);
        router.delete(route(routeName, { [routeParamKey]: id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`${itemType} deleted successfully`);
                onOpenChange(false);
                onSuccess?.();
            },
            onError: () => {
                toast.error(`Failed to delete ${itemType}`);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete {itemType}</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this {itemType.toLowerCase()}? This action
                        cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex space-x-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : `Delete ${itemType}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
