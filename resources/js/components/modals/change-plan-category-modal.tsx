import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChangePlanCategoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedPlanCategory: string;
    onPlanCategoryChange: (value: string) => void;
    selectedCount: number;
    isChangingPlanCategory: boolean;
    onConfirm: () => void;
}

export default function ChangePlanCategoryModal({
    open,
    onOpenChange,
    selectedPlanCategory,
    onPlanCategoryChange,
    selectedCount,
    isChangingPlanCategory,
    onConfirm,
}: ChangePlanCategoryModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Plan Category</DialogTitle>
                    <DialogDescription>Select a plan category to change for {selectedCount} selected phone number(s).</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-2">
                        <Select value={selectedPlanCategory} onValueChange={onPlanCategoryChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a plan category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="Daily">Daily</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="flex space-x-2 sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isChangingPlanCategory}>
                        Cancel
                    </Button>
                    <Button type="button" variant="default" onClick={onConfirm} disabled={isChangingPlanCategory || !selectedPlanCategory}>
                        {isChangingPlanCategory ? 'Changing...' : 'Change Plan Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
