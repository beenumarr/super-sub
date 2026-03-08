import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserGroup } from '@/types/phone-numbers';

interface MoveToGroupModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userGroups: UserGroup[];
    currentGroupId: number | null;
    targetGroupId: string;
    onTargetGroupChange: (value: string) => void;
    selectedCount: number;
    isMovingToGroup: boolean;
    onMove: () => void;
}

export default function MoveToGroupModal({
    open,
    onOpenChange,
    userGroups,
    currentGroupId,
    targetGroupId,
    onTargetGroupChange,
    selectedCount,
    isMovingToGroup,
    onMove,
}: MoveToGroupModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Move Phone Numbers to Group</DialogTitle>
                    <DialogDescription>Select a group to move {selectedCount} selected phone number(s) to.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-2">
                        <Select value={targetGroupId} onValueChange={onTargetGroupChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                                {userGroups
                                    .filter((group) => group.id != currentGroupId)
                                    .map((group) => (
                                        <SelectItem key={group.id} value={group.id.toString()}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="flex space-x-2 sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isMovingToGroup}>
                        Cancel
                    </Button>
                    <Button type="button" variant="default" onClick={onMove} disabled={isMovingToGroup}>
                        {isMovingToGroup ? 'Moving...' : 'Move Phone Numbers'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
