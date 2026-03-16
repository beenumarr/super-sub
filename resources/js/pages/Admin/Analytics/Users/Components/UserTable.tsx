import { useEffect, useState } from "react";
import { router, Link } from "@inertiajs/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";
import UserExportModal from "./UserExportModal";
import { toast } from "react-hot-toast";

interface UserTableProps {
    paginationModel: { page: number; pageSize: number };
    setPaginationModel: (model: any) => void;
    data: any;
    setFilter: (filters: any) => void;
    filters: any;
}

function UserTable({
    paginationModel,
    setPaginationModel,
    data,
    setFilter,
    filters,
}: UserTableProps) {
    const [rowCountState, setRowCountState] = useState(data?.meta?.total || 0);
    const [downloadLink, setDownloadLink] = useState("");
    const [exportModal, setExportModal] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        setRowCountState((prevRowCountState: number) =>
            data?.meta?.total !== undefined
                ? data?.meta?.total
                : prevRowCountState
        );
    }, [data?.meta?.total, setRowCountState]);

    const handleExport = async () => {
        try {
            setExporting(true);

            const response = await axios.post(route("exports.user-analytics"), {
                filters,
            });

            if (response.status === 200) {
                const responseData = response.data;
                setDownloadLink(responseData.fileUrl);
                toast.success("Export completed successfully");
            } else {
                toast.error("Export job submission failed");
            }
        } catch (error) {
            toast.error("Error during export");
            console.error("Error during export:", error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <>
            <div className="flex w-full mb-4 items-center gap-4">
                <div className="flex-1">
                    {/* Replace HeaderFilter component content here */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total: {data?.meta?.total}</p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={exporting}
                    className="gap-2"
                >
                    {exporting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4" />
                            Export
                        </>
                    )}
                </Button>
            </div>

            {/* Custom HTML Table */}
            <div className="overflow-x-auto border dark:border-gray-800 rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900/40 border-b dark:border-gray-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Wallet Balance
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Total Spending
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Total Funding
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Wallet Funding Count
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Transaction Count
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Referred By
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Last Login
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {data?.data && data.data.length > 0 ? (
                            data.data.map((row: any) => (
                                <tr
                                    key={row.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                        {row.name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                        {row.email}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                        {row.phone || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                        ₦{row.wallet_balance || "0"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                        ₦{row.total_spending || "0"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                        ₦{row.total_fundings || "0"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                        {row.wallet_funding_count || 0}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                        {row.transactions_count || 0}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                        {row.referal_username || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                        {row.last_login || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                            className="gap-1 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                                        >
                                            <Link href={route("admin.analytics.users.view", row.id)}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={11}
                                    className="px-4 py-3 text-center text-gray-500 dark:text-gray-400"
                                >
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data?.meta && (
                <div className="flex items-center justify-between mt-4 px-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {paginationModel.page + 1} of{" "}
                        {Math.ceil(data.meta.total / paginationModel.pageSize)}
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={paginationModel.page === 0}
                            onClick={() =>
                                setPaginationModel({
                                    ...paginationModel,
                                    page: paginationModel.page - 1,
                                })
                            }
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                paginationModel.page >=
                                Math.ceil(
                                    data.meta.total / paginationModel.pageSize
                                ) - 1
                            }
                            onClick={() =>
                                setPaginationModel({
                                    ...paginationModel,
                                    page: paginationModel.page + 1,
                                })
                            }
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <UserExportModal
                setFormModal={setExportModal}
                formModal={exportModal}
                processing={exporting}
                fileUrl={downloadLink}
            />
        </>
    );
}

export default UserTable;
