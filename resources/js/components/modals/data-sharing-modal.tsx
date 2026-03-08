import { NetworkIcon } from '@/components/shared/network-icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { PhoneNumber } from '@/types/phone-numbers';

interface DataSharingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    phoneNumbers: PhoneNumber[];
    selectedIds: number[];
    dataSharingAction: 'activate' | 'deactivate';
    isUpdatingDataSharing: boolean;
    onConfirm: () => void;
}

export default function DataSharingModal({
    open,
    onOpenChange,
    phoneNumbers,
    selectedIds,
    dataSharingAction,
    isUpdatingDataSharing,
    onConfirm,
}: DataSharingModalProps) {
    const selectedPhones = phoneNumbers.filter((phone) => selectedIds.includes(phone.id));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{dataSharingAction === 'activate' ? 'Activate Data Sharing' : 'Deactivate Data Sharing'}</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to {dataSharingAction} data sharing for {selectedIds.length} selected phone number(s)? This action
                        cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-40 overflow-y-auto">
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Selected phone numbers:</p>
                    {selectedPhones.map((phone) => (
                        <div key={phone.id} className="mb-1 flex items-center space-x-3 rounded-md bg-gray-50 p-2 dark:bg-gray-800">
                            <NetworkIcon network={phone.network.name} />
                            <div>
                                <p className="text-sm font-medium">{phone.number}</p>
                                <p className="text-xs text-gray-500">
                                    {phone.network.name} • {phone.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="flex space-x-2 sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdatingDataSharing}>
                        Cancel
                    </Button>
                    <Button type="button" variant="default" onClick={onConfirm} disabled={isUpdatingDataSharing}>
                        {isUpdatingDataSharing ? 'Processing...' : `Confirm ${dataSharingAction} Data Sharing`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
