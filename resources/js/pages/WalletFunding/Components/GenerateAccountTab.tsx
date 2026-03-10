import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

declare const axios: any;

export default function AccountTabs() {
    const [activeTab, setActiveTab] = useState<'permanent' | 'temporary'>('permanent');
    const [processing, setProcessing] = useState(false);

    const handleAction = async (url: string, successMessage: string) => {
        try {
            setProcessing(true);
            await axios.post(url, { all: true });
            toast.success(successMessage);
            router.reload();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="w-full">
            {/* Tab Headers */}
            <div className="flex gap-4 border-b">
                <button
                    type="button"
                    className={`border-b-2 px-4 py-2 text-sm font-medium ${
                        activeTab === 'permanent'
                            ? 'border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'
                    }`}
                    onClick={() => setActiveTab('permanent')}
                >
                    Permanent Account
                </button>
                <button
                    type="button"
                    className={`border-b-2 px-4 py-2 text-sm font-medium ${
                        activeTab === 'temporary'
                            ? 'border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                            : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'
                    }`}
                    onClick={() => setActiveTab('temporary')}
                >
                    Temporary Account
                </button>
            </div>

            {/* Tab Content */}
            <div className="mt-4 space-y-4">
                {activeTab === 'permanent' && (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Permanent Virtual Account
                        </h3>
                        <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                            To generate a Permanent Virtual Account, you may need to complete your KYC (Know Your Customer) process.
                        </p>
                        <Button
                            size="sm"
                            onClick={() =>
                                handleAction(
                                    '/refresh_funding_accounts',
                                    'Permanent account refreshed successfully',
                                )
                            }
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : 'Generate Account'}
                        </Button>
                    </div>
                )}

                {activeTab === 'temporary' && (
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Temporary Virtual Account
                        </h3>
                        <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                            Temporary Virtual Accounts come with transaction limits and are valid for a limited period of time.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                handleAction('/get_temp_accounts', 'Temporary account generated successfully')
                            }
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : 'Generate Account'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

