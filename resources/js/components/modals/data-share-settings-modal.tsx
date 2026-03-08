import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface DataPlan {
    id: number;
    name: string;
}

interface UserGroup {
    id: number;
    name: string;
    color: string;
}

interface PlanSetting {
    group_id: number | null;
}

interface DataShareSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dataSharePlans: DataPlan[];
    userGroups: UserGroup[];
    planSettings: Record<number, PlanSetting>;
    status?: string;
    success?: string;
}

export default function DataShareSettingsModal({
    open,
    onOpenChange,
    dataSharePlans,
    userGroups,
    planSettings,
    status,
    success,
}: DataShareSettingsModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form for editing data share plan settings
    const form = useForm({
        planSettings: Object.entries(planSettings).reduce(
            (acc, [planId, setting]) => {
                acc[planId] = {
                    group_id: setting.group_id,
                };
                return acc;
            },
            {} as Record<string, PlanSetting>,
        ),
    });

    const handleGroupChange = (planId: number, groupId: number | null) => {
        form.setData((prev) => ({
            ...prev,
            planSettings: {
                ...prev.planSettings,
                [planId.toString()]: {
                    ...prev.planSettings[planId.toString()],
                    group_id: groupId,
                },
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        form.put(route('datashare.settings.update'), {
            onSuccess: () => {
                setIsSubmitting(false);
                toast.success('Data share settings updated successfully');
                onOpenChange(false);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                Object.keys(errors).forEach((key) => {
                    toast.error(errors[key]);
                });
            },
        });
    };

    // Show success message
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (status) {
            toast.success(status);
        }
    }, [success, status]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Data Share Settings</DialogTitle>
                    <DialogDescription>Configure which phone number groups should be used for each data share plan.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardContent className="space-y-4 p-4">
                            {dataSharePlans.map((plan) => {
                                const setting = form.data.planSettings[plan.id.toString()];

                                return (
                                    <div key={plan.id} className="flex w-full items-center gap-4 border-b border-gray-200 pb-4 last:border-b-0">
                                        <Label htmlFor={`group-${plan.id}`} className="w-32 flex-shrink-0 text-sm font-medium">
                                            <span className="text-sm font-semibold">{plan.name}:</span>
                                        </Label>
                                        <Select
                                            value={setting?.group_id?.toString() || 'none'}
                                            onValueChange={(value) => handleGroupChange(plan.id, value === 'none' ? null : parseInt(value))}
                                        >
                                            <SelectTrigger id={`group-${plan.id}`} className="flex-1">
                                                <SelectValue placeholder="Select group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {userGroups.map((group) => (
                                                    <SelectItem key={group.id} value={group.id.toString()}>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: group.color }} />
                                                            <span>{group.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-theme-1 hover:bg-theme-1/90 text-white" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
