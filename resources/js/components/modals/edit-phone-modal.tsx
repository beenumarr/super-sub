import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { PhoneNumber } from '@/types/phone-numbers';
import { formatDate } from '@/utils';
import { BarChart3, ChevronDown, ChevronRight, Copy, RefreshCw, Star } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { toast } from 'react-hot-toast';

interface EditPhoneModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    phoneToEdit: PhoneNumber | null;
    editForm: {
        data: {
            plan_type_purchased: string;
            enable_datashare: boolean;
            priority: boolean;
            custom_share_enabled: boolean;
            share_preferences: Record<string, number>;
            _newSize: string;
            _newCount: string;
            plan_category: string;
            is_master_sim: boolean;
            status: 'CONNECTED' | 'DISCONNECTED' | 'DISABLED';
        };
        setData: (field: string, value: string | boolean | Record<string, number>) => void;
        errors: Record<string, string>;
    };
    isEditSubmitting: boolean;
    isResetLoading: boolean;
    onSubmit: FormEventHandler;
    onResetLimit: () => void;
    debug?: boolean;
}

export default function EditPhoneModal({
    open,
    onOpenChange,
    phoneToEdit,
    editForm,
    isEditSubmitting,
    isResetLoading,
    onSubmit,
    onResetLimit,
    debug = false,
}: EditPhoneModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
    const [showDebugSection, setShowDebugSection] = useState(false);
    const [showTransactions, setShowTransactions] = useState(false);

    const copyToClipboard = async (text: string, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            toast.success(`${fieldName} copied to clipboard`);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            toast.error('Failed to copy to clipboard');
        }
    };

    const toggleFieldExpansion = (fieldKey: string) => {
        setExpandedFields((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(fieldKey)) {
                newSet.delete(fieldKey);
            } else {
                newSet.add(fieldKey);
            }
            return newSet;
        });
    };

    const formatDateTime = (dateString: string | undefined, minimal: boolean = false) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (minimal) {
                // Format: 11/10/25, 10:23pm
                return date
                    .toLocaleString('en-US', {
                        year: '2-digit',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    })
                    .toLowerCase();
            }
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            });
        } catch (error) {
            return dateString; // Return original if parsing fails
        }
    };

    const getDebugData = (phone: PhoneNumber) => {
        const debugFields = [
            { key: 'session_token', label: 'Session Token', value: phone.session_token },
            { key: 'refresh_token', label: 'Refresh Token', value: phone.refresh_token },
            { key: 'token_id', label: 'Token ID', value: phone.token_id },
            { key: 'token_refresh_at', label: 'Token Refresh At', value: formatDateTime(phone.token_refresh_at) },
            { key: 'session_id', label: 'Session ID', value: phone.session_id },
            { key: 'token_expired_at', label: 'Token Expired At', value: formatDateTime(phone.token_expired_at) },
            { key: 'token_refresh_expires_at', label: 'Token Refresh Expires At', value: formatDateTime(phone.token_refresh_expires_at) },
            { key: 'last_api_response', label: 'Last API Response', value: phone.last_api_response },
            { key: 'has_active_plan', label: 'Has Active Plan', value: phone.has_active_plan?.toString() },
            { key: 'error_count', label: 'Error Count', value: phone.error_count?.toString() },
            { key: 'auth_user_id', label: 'Auth User ID', value: phone.auth_user_id },
            { key: 'public_key', label: 'Public Key', value: phone.public_key },
            { key: 'private_key', label: 'Private Key', value: phone.private_key },
            { key: 'mgnt_refresh_token', label: 'Management Refresh Token', value: phone.mgnt_refresh_token },
            { key: 'mgnt_token_id', label: 'Management Token ID', value: phone.mgnt_token_id },
        ];

        return debugFields.filter((field) => field.value !== undefined && field.value !== null && field.value !== '');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-l max-h-[90vh] overflow-y-auto !px-2 sm:!px-4">
                <DialogHeader>
                    <DialogTitle className="text-sm">Update Number Settings</DialogTitle>
                </DialogHeader>

                {phoneToEdit && (
                    <div className="space-y-3">
                        {/* Phone Information Section */}
                        <div className="rounded-md border border-gray-200 p-2 dark:border-gray-700">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Number:</span>
                                    <span className="text-sm font-medium">{phoneToEdit.number}</span>
                                </div>
                                {/* <div className="flex items-center gap-2">
                                    <Signal className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Network:</span>
                                    <span className="text-sm font-medium">{phoneToEdit.network.name}</span>
                                </div> */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Data:</span>
                                    <span className="text-sm font-medium">{phoneToEdit.data_balance || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Airtime:</span>
                                    <span className="text-sm font-medium">₦{phoneToEdit.airtime_balance || 'N/A'}</span>
                                </div>
                                {/* <div className="flex items-center gap-2">
                                    <Signal className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Tariff Plan:</span>
                                    <span className="text-sm font-medium">{phoneToEdit.tarrif_plan || 'N/A'}</span>
                                </div> */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                                    <span className="text-sm font-medium">{formatDate(phoneToEdit.created_at, true)}</span>
                                </div>
                            </div>

                            {Boolean(phoneToEdit.custom_share_enabled) && phoneToEdit.monthly_share_usage && (
                                <div className="mt-2 sm:col-span-2">
                                    <h4 className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Data Share Usage</h4>
                                    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                                        {Object.entries(phoneToEdit.monthly_share_usage).map(([size, count]) => (
                                            <div key={size} className="flex items-center gap-2 text-sm">
                                                <BarChart3 className="h-4 w-4 text-gray-500" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {(() => {
                                                        const gbValue = size.replace(/^gb_/, '');
                                                        const floatVal = parseFloat(gbValue);
                                                        if (floatVal < 1) {
                                                            return `${Math.round(floatVal * 1000)}MB:`;
                                                        }
                                                        return `${gbValue.replace(/\.0$/, '')}GB:`;
                                                    })()}
                                                </span>
                                                <span className="font-medium">{count}x</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Last Transactions Section */}
                        {phoneToEdit && phoneToEdit.last_transactions && phoneToEdit.last_transactions.length > 0 && (
                            <div className="">
                                <button
                                    type="button"
                                    onClick={() => setShowTransactions(!showTransactions)}
                                    className="hover:bg-accent mb-2 flex w-full items-center justify-between rounded p-1"
                                >
                                    <h4 className="flex text-xs font-normal">
                                        Show Last 5 Transactions{' '}
                                        <div
                                            className="ml-1 transition-transform duration-300"
                                            style={{ transform: showTransactions ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </h4>
                                </button>

                                <div
                                    className={`bg-accent/30 overflow-hidden transition-all duration-300 ease-in-out ${
                                        showTransactions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-accent border-b">
                                                    <th className="px-2 py-1 text-left font-medium">Date</th>
                                                    <th className="px-2 py-1 text-left font-medium">Beneficiary</th>
                                                    <th className="px-2 py-1 text-left font-medium">API Response</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {phoneToEdit.last_transactions.map((transaction, index) => (
                                                    <tr key={transaction.id} className="border-accent border-b">
                                                        <td className="px-2 py-1 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                                            {formatDateTime(transaction.created_at, true)}
                                                        </td>
                                                        <td className="px-2 py-1 text-gray-600 dark:text-gray-400">
                                                            <span className="block max-w-[100px] truncate">{transaction.beneficiary || 'N/A'}</span>
                                                        </td>
                                                        <td className="px-2 py-1 text-gray-600 dark:text-gray-400">
                                                            <span className="block max-w-[200px] break-words">
                                                                {transaction.api_response || 'N/A'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Debug Data Section - Only show for admin users */}
                        {debug && phoneToEdit && (
                            <div className="rounded-md border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20">
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200">Debug Information</h4>
                                    <Switch
                                        checked={showDebugSection}
                                        onCheckedChange={setShowDebugSection}
                                        className="data-[state=checked]:bg-orange-600"
                                    />
                                </div>

                                {showDebugSection && (
                                    <>
                                        {/* Status Update Section */}
                                        <div className="mb-4 rounded border border-orange-300 bg-orange-100 p-3 dark:border-orange-600 dark:bg-orange-800/30">
                                            <div className="mb-2 flex items-center justify-between">
                                                <Label className="text-sm font-medium text-orange-800 dark:text-orange-200">Update Status</Label>
                                                <span className="text-xs text-orange-600 dark:text-orange-300">
                                                    Current: <span className="font-semibold">{editForm.data.status}</span>
                                                </span>
                                            </div>
                                            <Select value={editForm.data.status} onValueChange={(value) => editForm.setData('status', value)}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CONNECTED">CONNECTED</SelectItem>
                                                    <SelectItem value="DISCONNECTED">DISCONNECTED</SelectItem>
                                                    <SelectItem value="DISABLED">DISABLED</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Debug Data Fields */}
                                        {getDebugData(phoneToEdit).length > 0 && (
                                            <div className="max-w-full space-y-2">
                                                {getDebugData(phoneToEdit).map((field) => {
                                                    const isExpanded = expandedFields.has(field.key);
                                                    const isLongValue = field.value && field.value.length > 50;

                                                    return (
                                                        <div
                                                            key={field.key}
                                                            className="rounded border border-orange-200 bg-white dark:border-orange-700 dark:bg-gray-800"
                                                        >
                                                            {/* Header - Always visible */}
                                                            <div className="flex items-center justify-between p-2">
                                                                <div className="flex min-w-0 flex-1 items-center space-x-2">
                                                                    {isLongValue && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => toggleFieldExpansion(field.key)}
                                                                            className="h-4 w-4 p-0 hover:bg-orange-100 dark:hover:bg-orange-800"
                                                                        >
                                                                            {isExpanded ? (
                                                                                <ChevronDown className="h-3 w-3 text-orange-600" />
                                                                            ) : (
                                                                                <ChevronRight className="h-3 w-3 text-orange-600" />
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                    <div className="truncate text-xs font-medium text-orange-700 dark:text-orange-300">
                                                                        {field.label}
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => copyToClipboard(field.value || '', field.label)}
                                                                    className="h-6 w-6 flex-shrink-0 p-0 hover:bg-orange-100 dark:hover:bg-orange-800"
                                                                >
                                                                    <Copy
                                                                        className={`h-3 w-3 ${copiedField === field.label ? 'text-green-600' : 'text-orange-600'}`}
                                                                    />
                                                                </Button>
                                                            </div>

                                                            {/* Value - Collapsible for long values */}
                                                            {isLongValue ? (
                                                                <div
                                                                    className={`overflow-hidden transition-all duration-200 ${
                                                                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                                    }`}
                                                                >
                                                                    <div className="px-2 pb-2">
                                                                        <div className="max-w-full rounded bg-gray-50 p-2 font-mono text-xs break-all text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                                                            {field.value}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="px-2 pb-2">
                                                                    <div className="max-w-full font-mono text-xs break-all text-gray-600 dark:text-gray-400">
                                                                        {field.value}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-3">
                            {/* <div className="space-y-1">
                                <Label htmlFor="plan_type_purchased">Sim Type</Label>
                                <Select
                                    value={editForm.data.plan_type_purchased}
                                    onValueChange={(value) => editForm.setData('plan_type_purchased', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Data Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Data Share">Data Share</SelectItem>
                                        <SelectItem value="Direct Gifting">Direct Gifting</SelectItem>
                                    </SelectContent>
                                </Select>
                                {editForm.errors.plan_type_purchased && <p className="text-sm text-red-500">{editForm.errors.plan_type_purchased}</p>}
                            </div> */}

                            <div className="my-2 space-y-1">
                                <Label htmlFor="phoneNumber">Select Plan Type</Label>
                                <Select
                                    value={editForm.data.plan_category}
                                    onValueChange={(value) => editForm.setData('plan_category', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Plan Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                    </SelectContent>
                                </Select>
                                {editForm.errors.plan_category && <p className="text-sm text-red-500">{editForm.errors.plan_category}</p>}
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="enable_datashare" className="flex cursor-pointer items-center space-x-2">
                                        <Switch
                                            id="enable_datashare"
                                            className="bg-theme-1"
                                            checked={editForm.data.enable_datashare}
                                            onCheckedChange={(checked) => editForm.setData('enable_datashare', !!checked)}
                                        />
                                        {editForm.data.enable_datashare ? 'Active' : 'Deactivated'}
                                    </Label>
                                </div>

                                <Button type="button" variant="outline" onClick={onResetLimit} className="bg-accent mt-1" disabled={isResetLoading}>
                                    {isResetLoading && <RefreshCw className="h-3 w-3 animate-spin" />} Reset Limit
                                </Button>
                            </div>

                            {phoneToEdit.network.name === 'MTN' && (
                                <>
                                    <div className="my-4 flex justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="priority"
                                                checked={editForm.data.priority}
                                                onCheckedChange={(checked) => editForm.setData('priority', !!checked)}
                                                className="border-theme-1 dark:border-white"
                                            />
                                            <Label htmlFor="priority" className="flex cursor-pointer items-center text-sm">
                                                Set as Priority <Star className="ml-1 h-3 w-3 text-yellow-500" />
                                            </Label>
                                            {editForm.errors.priority && <p className="text-sm text-red-500">{editForm.errors.priority}</p>}
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_master_sim"
                                                className="border-theme-1 dark:border-white"
                                                checked={editForm.data.is_master_sim}
                                                onCheckedChange={(checked) => editForm.setData('is_master_sim', !!checked)}
                                            />
                                            <Label htmlFor="is_master_sim" className="flex cursor-pointer items-center gap-2 text-sm">
                                                Set as Master SIM
                                            </Label>
                                            {editForm.errors.is_master_sim && <p className="text-sm text-red-500">{editForm.errors.is_master_sim}</p>}
                                        </div>
                                    </div>

                                    {/* Custom Share Toggle */}
                                    <div className="space-y-1">
                                        <Label htmlFor="custom_share_enabled" className="flex items-center space-x-2 text-sm">
                                            <Switch
                                                id="custom_share_enabled"
                                                checked={editForm.data.custom_share_enabled}
                                                onCheckedChange={(checked) => editForm.setData('custom_share_enabled', !!checked)}
                                            />
                                            <span>Enable Smart Share</span>
                                        </Label>
                                    </div>

                                    {/* Custom Share Preferences */}
                                    {Boolean(editForm.data.custom_share_enabled) && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-medium">Smart Share Limits</Label>
                                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Total:{' '}
                                                    {Object.entries(editForm.data.share_preferences || {}).reduce((sum, [size, count]) => {
                                                        // Remove 'gb_' prefix if present
                                                        const sizeNum = parseFloat(size.replace(/^gb_/, ''));
                                                        return sum + sizeNum * Number(count);
                                                    }, 0)}{' '}
                                                    GB | Limit Count:
                                                    {(() => {
                                                        const total = Object.entries(editForm.data.share_preferences || {}).reduce(
                                                            (sum, [, count]) => sum + Number(count),
                                                            0,
                                                        );
                                                        if (total > 10) {
                                                            return <span className="font-semibold text-red-500"> {total} (Max allowed is 10)</span>;
                                                        }
                                                        return total;
                                                    })()}
                                                </div>
                                            </div>

                                            <div className="grid w-full grid-cols-2 gap-2 rounded-md border p-2 pt-3 dark:border-gray-700">
                                                {[
                                                    { label: '200MB', key: 'gb_0.2' },
                                                    { label: '500MB', key: 'gb_0.5' },
                                                    { label: '1GB', key: 'gb_1.0' },
                                                    { label: '2GB', key: 'gb_2.0' },
                                                    { label: '3GB', key: 'gb_3.0' },
                                                    { label: '5GB', key: 'gb_5.0' },
                                                ].map(({ label, key }) => (
                                                    <div key={key} className="flex items-center space-x-1 pb-2 sm:space-x-2">
                                                        <div className="w-8 text-xs font-medium text-gray-700 dark:text-gray-300">{label}: </div>
                                                        <Select
                                                            value={(editForm.data.share_preferences?.[key] ?? 0).toString()}
                                                            onValueChange={(value) => {
                                                                const newPrefs = { ...editForm.data.share_preferences };
                                                                const val = parseInt(value, 10);
                                                                newPrefs[key] = isNaN(val) ? 0 : val;
                                                                editForm.setData('share_preferences', newPrefs);
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-32">
                                                                <SelectValue placeholder="Select count" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Array.from({ length: 11 }, (_, i) => (
                                                                    <SelectItem key={i} value={i.toString()}>
                                                                        {i} times
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isEditSubmitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-theme-1 hover:bg-theme-1/90 text-white" disabled={isEditSubmitting}>
                                    {isEditSubmitting ? 'Saving...' : 'Save Settings'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
