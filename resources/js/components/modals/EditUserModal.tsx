import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FormEventHandler } from 'react';

export interface EditUserModalUser {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
    role: string;
    wallet: {
        balance: number;
    };
    email_verified_at: string | null;
    is_active?: boolean;
    kyc_level?: string;
}

interface EditUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: EditUserModalUser | null;
    editForm: {
        data: {
            password: string;
            email_verified_at: string | null;
            wallet_balance: number;
            is_active: boolean;
            kyc_level: string;
        };
        setData: (field: string, value: string | boolean | number | null) => void;
        errors: Record<string, string>;
    };
    isEditSubmitting: boolean;
    onSubmit: FormEventHandler;
}

export default function EditUserModal({ open, onOpenChange, user, editForm, isEditSubmitting, onSubmit }: EditUserModalProps) {
    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit User: {user.name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Leave blank to keep unchanged"
                            value={editForm.data.password}
                            onChange={(e) => editForm.setData('password', e.target.value)}
                        />
                        {editForm.errors.password && <p className="text-sm text-red-500">{editForm.errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="email_verified_at_toggle">Email Verified</Label>
                        <Switch
                            id="email_verified_at_toggle"
                            checked={!!editForm.data.email_verified_at}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    const now = new Date();
                                    const formatted = now.toISOString().slice(0, 19);
                                    editForm.setData('email_verified_at', formatted);
                                } else {
                                    editForm.setData('email_verified_at', null);
                                }
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="is_active_toggle">Active</Label>
                        <Switch
                            id="is_active_toggle"
                            checked={!!editForm.data.is_active}
                            onCheckedChange={(checked) => editForm.setData('is_active', checked)}
                        />
                    </div>

                    {editForm.data.email_verified_at && (
                        <p className="text-xs text-gray-500">Verified At: {new Date(editForm.data.email_verified_at).toLocaleString()}</p>
                    )}

                    {editForm.errors.email_verified_at && <p className="text-sm text-red-500">{editForm.errors.email_verified_at}</p>}

                    <div>
                        <Label htmlFor="kyc_level">KYC Level</Label>
                        <Select value={editForm.data.kyc_level} onValueChange={(value) => editForm.setData('kyc_level', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select KYC level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BASIC">Basic</SelectItem>
                                <SelectItem value="LEVEL1">Level 1</SelectItem>
                                <SelectItem value="LEVEL2">Level 2</SelectItem>
                                <SelectItem value="LEVEL3">Level 3</SelectItem>
                            </SelectContent>
                        </Select>
                        {editForm.errors.kyc_level && <p className="text-sm text-red-500">{editForm.errors.kyc_level}</p>}
                    </div>

                    <div>
                        <Label htmlFor="wallet_balance">Wallet Balance (₦)</Label>
                        <Input
                            id="wallet_balance"
                            type="number"
                            step="0.01"
                            value={editForm.data.wallet_balance}
                            onChange={(e) => editForm.setData('wallet_balance', parseFloat(e.target.value))}
                        />
                        {editForm.errors.wallet_balance && <p className="text-sm text-red-500">{editForm.errors.wallet_balance}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isEditSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isEditSubmitting}>
                            {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
