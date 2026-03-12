import { FC } from 'react';

interface Transactionable {
    token?: string;
    description?: string;
}

interface EditData {
    id: number;
    amount: string | number;
    description: string;
    status: string;
    api_response: string;
    balance_before?: string | number;
    balance_after?: string | number;
    reference: string;
    date?: string;
    transactionable?: Transactionable;
}

interface UpdateTransactionFormProps {
    editData: EditData;
}

const UpdateTransactionForm: FC<UpdateTransactionFormProps> = ({ editData }) => {
    return (
        <div className="w-full flex flex-col gap-4 p-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium">Amount</label>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">₦{editData.amount}</div>
                </div>
                <div>
                    <label className="text-sm font-medium">Date</label>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{editData.date || 'N/A'}</div>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium">Reference ID</label>
                <div className="text-sm text-gray-700 dark:text-gray-300 break-words font-mono">{editData.reference}</div>
            </div>

            <div>
                <label className="text-sm font-medium">Description</label>
                <div className="text-sm text-gray-700 dark:text-gray-300">{editData.description}</div>
            </div>

            {editData.transactionable?.token && (
                <div>
                    <label className="text-sm font-medium">Token</label>
                    <div className="text-sm text-gray-700 dark:text-gray-300 break-words font-mono text-xs">
                        {editData.transactionable?.token}
                    </div>
                </div>
            )}

            <div>
                <label className="text-sm font-medium">Status</label>
                <div className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300">{editData.status}</div>
            </div>

            <div>
                <label className="text-sm font-medium">API Response</label>
                <div className="text-sm text-gray-700 dark:text-gray-300 break-words bg-gray-50 dark:bg-gray-900 p-2 rounded max-h-32 overflow-y-auto">
                    {editData.api_response || 'N/A'}
                </div>
            </div>

            {editData.balance_before !== undefined && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Balance Before</label>
                        <div className="text-sm text-gray-700 dark:text-gray-300">₦{editData.balance_before}</div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Balance After</label>
                        <div className="text-sm text-gray-700 dark:text-gray-300">₦{editData.balance_after}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdateTransactionForm;
