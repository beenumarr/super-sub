import { NetworkIcon } from '@/components/shared/network-icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { PhoneNumber } from '@/types/phone-numbers';

interface DeletePhoneModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    phoneToDelete: PhoneNumber | null;
    isDeleting: boolean;
    onDelete: () => void;
}

export default function DeletePhoneModal({ open, onOpenChange, phoneToDelete, isDeleting, onDelete }: DeletePhoneModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Phone Number</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this phone number?</DialogDescription>
                </DialogHeader>

                {phoneToDelete && (
                    <div className="flex items-center space-x-3 rounded-md bg-gray-50 p-2 dark:bg-gray-800">
                        <NetworkIcon network={phoneToDelete.network.name} />
                        <div>
                            <p className="font-medium">{phoneToDelete.number}</p>
                            <p className="text-sm text-gray-500">
                                {phoneToDelete.network.name} • {phoneToDelete.status}
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter className="flex space-x-2 sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={onDelete} disabled={isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete Phone Number'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
