import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface Transaction {
    id: number;
    reference: string;
    user: { name: string };
    amount: number;
    phone_number: string;
    network: string;
    status: string;
    success: number;
    failed: number;
    api_response: string;
}

interface TransactionTableProps {
    paginationModel: { page: number; pageSize: number };
    setPaginationModel: (model: { page: number; pageSize: number }) => void;
    data: { data: Transaction[]; meta: { total: number } };
    setViewDetailModal: (modal: { show: boolean; id: number }) => void;
}

function TransactionTable({
    paginationModel,
    setPaginationModel,
    data,
    setViewDetailModal,
}: TransactionTableProps): JSX.Element {
    const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case "completed":
                return "secondary";
            case "processing":
                return "outline";
            case "failed":
                return "destructive";
            default:
                return "default";
        }
    };

    const totalPages = Math.ceil((data?.meta?.total || 0) / paginationModel.pageSize);
    const currentPage = paginationModel.page + 1;

    const handlePrevious = () => {
        if (paginationModel.page > 0) {
            setPaginationModel({
                ...paginationModel,
                page: paginationModel.page - 1,
            });
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setPaginationModel({
                ...paginationModel,
                page: paginationModel.page + 1,
            });
        }
    };

    return (
        <div className="w-full space-y-4">
            <div className="overflow-x-auto border dark:border-gray-800 rounded-lg">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/40 border-b dark:border-gray-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction ID</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Network</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Count</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {data?.data?.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                                <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">{transaction.reference}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{transaction.user?.name}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">₦{transaction.amount}</td>
                                <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">{transaction.phone_number}</td>
                                <td className="px-4 py-3 text-sm">
                                    <Badge variant="outline">{transaction.network}</Badge>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <div className="flex flex-col gap-2">
                                        <Badge variant={getStatusColor(transaction.status)}>
                                            {transaction.status}
                                        </Badge>
                                        <div className="flex gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                ✓ {transaction.success}
                                            </Badge>
                                            <Badge variant="destructive" className="text-xs">
                                                ✗ {transaction.failed}
                                            </Badge>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {transaction.api_response && (
                                        <span className="font-mono text-xs truncate block max-w-xs">{transaction.api_response}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setViewDetailModal({
                                                show: true,
                                                id: transaction.id,
                                            })
                                        }
                                        className="gap-2"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        View
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Page {currentPage} of {totalPages} ({data?.meta?.total || 0} total)
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={paginationModel.page === 0}
                        className="gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={currentPage >= totalPages}
                        className="gap-2"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default memo(TransactionTable);
