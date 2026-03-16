import { Link, usePage, Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { ChevronLeft, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type BreadcrumbItem } from "@/types";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ViewUser(props: any) {
    const { user } = usePage().props;
    const [activeTab, setActiveTab] = useState("overview");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [apiKey, setApiKey] = useState(user?.api_key || null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: route("dashboard") },
        { title: "Analytics", href: route("admin.dashboard") },
        { title: "Users", href: route("admin.analytics") },
        { title: user?.name || "User Details" },
    ];

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
    };

    const handleGenerateApiKey = async () => {
        setIsGenerating(true);
        try {
            const csrfToken = getCsrfToken();

            if (!csrfToken) {
                throw new Error("CSRF token not found");
            }

            const response = await fetch(route("admin.users.generate-api-key", user.id), {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.api_key) {
                setApiKey(data.api_key);
                setShowApiKey(true);
                toast.success("API Key generated successfully!");
            } else {
                throw new Error("No API key in response");
            }
        } catch (error) {
            console.error("API Key generation error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to generate API Key");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyApiKey = () => {
        if (apiKey) {
            navigator.clipboard.writeText(apiKey);
            toast.success("API Key copied to clipboard!");
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Details" />
            <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route("admin.analytics")} className="gap-2">
                            <ChevronLeft className="h-4 w-4" />
                            Back to Analytics
                        </Link>
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === "overview"
                                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                                : "text-gray-600 dark:text-gray-400 border-b-2 border-transparent"
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("transactions")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === "transactions"
                                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                                : "text-gray-600 dark:text-gray-400 border-b-2 border-transparent"
                        }`}
                    >
                        Transactions
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                                <DetailsRow title="Name" value={user?.name || "-"} />
                                <DetailsRow title="Email" value={user?.email || "-"} />
                                <DetailsRow title="Phone" value={user?.phone_number || user?.phone || "-"} />
                                <DetailsRow title="Package" value={user?.package_name || "-"} />
                                <DetailsRow title="Referred By" value={user?.referal_username || "-"} />
                                <DetailsRow title="Created At" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"} />
                                <DetailsRow title="Last Login" value={user?.last_login ? new Date(user.last_login).toLocaleDateString() : "-"} />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Analytics</h3>
                                <DetailsRow
                                    title="Wallet Balance"
                                    value={`₦${(user?.wallet_balance || 0).toLocaleString()}`}
                                />
                                <DetailsRow
                                    title="Total Spending"
                                    value={`₦${(user?.total_spending || 0).toLocaleString()}`}
                                />
                                <DetailsRow
                                    title="Total Funding"
                                    value={`₦${(user?.total_fundings || 0).toLocaleString()}`}
                                />
                                <DetailsRow
                                    title="Wallet Funding Count"
                                    value={user?.wallet_funding_count || 0}
                                />
                                <DetailsRow
                                    title="Transaction Count"
                                    value={user?.transactions_count || 0}
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">KYC & Security</h3>
                                <DetailsRow title="KYC Status" value={user?.kyc_verified_at ? "Verified" : "Not Verified"} />
                                <DetailsRow title="KYC Level" value={user?.kyc_level || "-"} />
                                <DetailsRow title="NIN" value={user?.nin || "-"} />
                                <DetailsRow title="BVN" value={user?.bvn || "-"} />
                                <div className="flex w-full py-3 px-4 bg-gray-50 dark:bg-gray-900/40 rounded border border-gray-200 dark:border-gray-800">
                                    <span className="w-1/2 font-medium text-gray-700 dark:text-gray-300">API Key</span>
                                    <div className="w-1/2 flex items-center justify-end gap-2">
                                        {apiKey ? (
                                            <>
                                                <code className="text-xs bg-gray-800 text-gray-100 px-2 py-1 rounded font-mono">
                                                    {showApiKey ? apiKey : "••••••••"}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={handleCopyApiKey}
                                                    title="Copy API Key"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-gray-500 dark:text-gray-400">-</span>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleGenerateApiKey}
                                            disabled={isGenerating}
                                        >
                                            <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                                            {isGenerating ? "Generating..." : "Generate"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="my-6">
                            <h2 className="text-lg font-semibold dark:text-white mb-4">Funding Accounts</h2>
                            <AccountTable accounts={user?.funding_accounts || user?.fundingAccounts || []} />
                        </div>
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === "transactions" && (
                    <div className="my-6">
                        <h2 className="text-lg font-semibold dark:text-white mb-4">Recent Transactions</h2>
                        <TransactionsTable transactions={user?.transactions || []} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

interface DetailsRowProps {
    title: string;
    value: string | number;
}

function DetailsRow({ title, value }: DetailsRowProps) {
    return (
        <div className="flex w-full py-3 px-4 bg-gray-50 dark:bg-gray-900/40 rounded border border-gray-200 dark:border-gray-800">
            <span className="w-1/2 font-medium text-gray-700 dark:text-gray-300">{title}</span>
            <span className="w-1/2 text-gray-900 dark:text-white text-right">{value}</span>
        </div>
    );
}

interface AccountTableProps {
    accounts: any[];
}

function AccountTable({ accounts }: AccountTableProps) {
    if (!accounts || accounts.length === 0) {
        return (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                No funding accounts found
            </p>
        );
    }

    return (
        <div className="overflow-x-auto border dark:border-gray-800 rounded-lg">
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/40 border-b dark:border-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Bank Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Account Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Reference
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {accounts.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {row.bank_name?.toUpperCase()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {row.account_number}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {row.reference}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

interface TransactionsTableProps {
    transactions: any[];
}

function TransactionsTable({ transactions }: TransactionsTableProps) {
    if (!transactions || transactions.length === 0) {
        return (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                No transactions found
            </p>
        );
    }

    return (
        <div className="overflow-x-auto border dark:border-gray-800 rounded-lg">
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/40 border-b dark:border-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {transactions.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {row.transactionable_type || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                ₦{(row.amount || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    row.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                    row.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                                    row.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                                    'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                                }`}>
                                    {row.status || "-"}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {row.reference || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
