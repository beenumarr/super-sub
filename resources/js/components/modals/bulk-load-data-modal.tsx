import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap } from 'lucide-react';

interface DataPlan {
    id: number;
    name: string;
    size: number;
    volume: string;
    price: number;
    validity?: number;
    description?: string;
    category?: {
        name: string;
        network?: {
            name: string;
        };
    };
}

interface BulkLoadDataModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dataPlans?: DataPlan[];
    selectedPlanId: string;
    onPlanChange: (planId: string) => void;
    selectedCount: number;
    isLoading: boolean;
    onConfirm: () => void;
    enableSimCheck: boolean;
    onEnableSimCheckChange: (value: boolean) => void;
}

export default function BulkLoadDataModal({
    open,
    onOpenChange,
    dataPlans = [],
    selectedPlanId,
    onPlanChange,
    selectedCount,
    isLoading,
    onConfirm,
    enableSimCheck,
    onEnableSimCheckChange,
}: BulkLoadDataModalProps) {
    const selectedPlan = dataPlans?.find((plan) => plan.id.toString() === selectedPlanId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                        Bulk Load Data
                    </DialogTitle>
                    <DialogDescription>
                        Select a data plan to load for {selectedCount} selected phone number{selectedCount !== 1 ? 's' : ''}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="data-plan">Data Plan</Label>
                        <Select value={selectedPlanId} onValueChange={onPlanChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a data plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {dataPlans?.map((plan) => (
                                    <SelectItem key={plan.id} value={plan.id.toString()}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{plan.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {plan.size} {plan.volume} • ₦{plan.price.toLocaleString()}
                                                {plan.validity && ` • ${plan.validity} days`}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedPlan && (
                        <div className="rounded-md border bg-gray-50 p-3 dark:bg-gray-800">
                            <h4 className="mb-2 text-sm font-medium">Selected Plan Details:</h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                                    <span className="font-medium">{selectedPlan.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Size:</span>
                                    <span className="font-medium">
                                        {selectedPlan.size} {selectedPlan.volume}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                                    <span className="font-medium">₦{selectedPlan.price.toLocaleString()}</span>
                                </div>
                                {selectedPlan.validity && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Validity:</span>
                                        <span className="font-medium">{selectedPlan.validity} days</span>
                                    </div>
                                )}
                                {selectedPlan.category?.network?.name && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Network:</span>
                                        <span className="font-medium">{selectedPlan.category.network.name}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                                    <span className="font-medium text-blue-600">₦{(selectedPlan.price * selectedCount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-3 rounded-md border p-3">
                        <Checkbox
                            id="enable-sim-check"
                            checked={enableSimCheck}
                            onCheckedChange={(value) => onEnableSimCheckChange(value === true)}
                        />
                        <div className="space-y-1">
                            <Label htmlFor="enable-sim-check" className="text-sm font-medium">
                                Enable SIM limit check
                            </Label>
                            <p className="text-muted-foreground text-xs">Skip numbers that have reached their monthly data share limit.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onConfirm} disabled={!selectedPlanId || isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading ? (
                            <>
                                <Zap className="mr-2 h-4 w-4 animate-pulse" />
                                Loading Data...
                            </>
                        ) : (
                            <>
                                <Zap className="mr-2 h-4 w-4" />
                                Load Data for {selectedCount} Number{selectedCount !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
