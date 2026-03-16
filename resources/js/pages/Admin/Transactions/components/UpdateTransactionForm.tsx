import { useForm } from '@inertiajs/react';
import { FC, FormEvent } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface EditData {
    id: number;
    amount: number;
    description: string;
    status: string;
    api_response: string;
    balance_before?: number;
    balance_after?: number;
    updatable?: boolean;
    transactionable?: {
        token?: string;
    };
}

interface UpdateTransactionFormProps {
    editData: EditData;
    handleClose: () => void;
}

const UpdateTransactionForm: FC<UpdateTransactionFormProps> = ({ editData, handleClose }) => {
    const { data, setData, put, processing } = useForm({
        status: editData.status ?? '',
    });

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(
            route('admin.transactions.update', {
                transaction: editData.id,
            }),
            {
                onSuccess: () => {
                    handleClose();
                },
                onError: () => {
                    // Errors will be handled by component state
                },
            }
        );
    };

    return (
        <form onSubmit={submit} className="w-full flex flex-col gap-4 p-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Amount</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{editData.amount}</div>
                </div>
                <div>
                    <label className="text-sm font-medium">Description</label>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{editData.description}</div>
                </div>
            </div>

            {editData.transactionable?.token && (
                <div>
                    <label className="text-sm font-medium">Token</label>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{editData.transactionable?.token}</div>
                </div>
            )}

            <div>
                <label className="text-sm font-medium">Status</label>
                {editData.updatable ? (
                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refund</SelectItem>
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300">{editData.status}</div>
                )}
            </div>

            <div>
                <label className="text-sm font-medium">API Response</label>
                <div className="text-sm text-gray-700 dark:text-gray-300 break-words">{editData.api_response}</div>
            </div>

            {editData.balance_before !== undefined && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Balance Before</label>
                        <div className="text-sm text-gray-700 dark:text-gray-300">{editData.balance_before}</div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Balance After</label>
                        <div className="text-sm text-gray-700 dark:text-gray-300">{editData.balance_after}</div>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                </Button>
                {editData.updatable && (
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Updating...' : 'Update'}
                    </Button>
                )}
            </div>
        </form>
    );
};

export default UpdateTransactionForm;
