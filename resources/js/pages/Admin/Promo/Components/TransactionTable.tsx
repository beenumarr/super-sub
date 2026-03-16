import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationModel {
    page: number;
    pageSize: number;
}

interface TransactionData {
    id: number;
    reference: string;
    user?: {
        name: string;
        phone: string;
    };
    amount: number;
    description: string;
    date: string;
    status: "success" | "pending" | "failed";
    api_response?: string;
}

interface TransactionTableData {
    data: TransactionData[];
    meta?: {
        total: number;
    };
}

interface TransactionTableProps {
    paginationModel: PaginationModel;
    setPaginationModel: (model: PaginationModel) => void;
    data: TransactionTableData;
    setViewDetailModal?: (modal: { show: boolean; id: number }) => void;
}

function TransactionTable({
    paginationModel,
    setPaginationModel,
    data,
    setViewDetailModal,
}: TransactionTableProps) {
    const handlePreviousPage = () => {
        if (paginationModel.page > 0) {
            setPaginationModel({
                ...paginationModel,
                page: paginationModel.page - 1,
            });
        }
    };

    const handleNextPage = () => {
        const maxPages = Math.ceil((data?.meta?.total || 0) / paginationModel.pageSize);
        if (paginationModel.page < maxPages - 1) {
            setPaginationModel({
                ...paginationModel,
                page: paginationModel.page + 1,
            });
        }
    };

    const hasData = data?.data && data.data.length > 0;
    const totalPages = Math.ceil((data?.meta?.total || 0) / paginationModel.pageSize);

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Transaction ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Amount (₦)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                API Response
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {!hasData ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No transactions found
                                </td>
                            </tr>
                        ) : (
                            data.data.map((row: any) => (
                                <tr
                                    key={row.id}
                                    className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer"
                                    onClick={() => setViewDetailModal?.({ show: true, id: row.id })}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {row.reference}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {row.user?.name}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {row.user?.phone}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        ₦{Number(row.amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col max-w-xs">
                                            <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                                                {row.description}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {row.date}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                                row.status === "success"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                                    : row.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                                            }`}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                        {row.api_response || "—"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {hasData && (
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {paginationModel.page + 1} of {totalPages} • Total: {data?.meta?.total || 0} records
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePreviousPage}
                            disabled={paginationModel.page === 0}
                            className="gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={paginationModel.page >= totalPages - 1}
                            className="gap-1"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(TransactionTable);
