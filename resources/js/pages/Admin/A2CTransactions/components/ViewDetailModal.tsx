import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface TransactionDetails {
    id: number;
    amount: string;
    phone_number: string;
    network: string;
    quantity: string;
    status: string;
    date: string;
    success: number;
    failed: number;
    api_response: string;
}

interface ViewDetailModalProps {
    setViewDetailModal: (modal: { show: boolean; id: string | number }) => void;
    viewDetailModal: { show: boolean; id: string | number };
}

const ViewDetailModal = ({ setViewDetailModal, viewDetailModal }: ViewDetailModalProps) => {
    const [transactionDetails, setTransactionDetails] = useState<Partial<TransactionDetails>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/airtime_to_cash/transaction/${viewDetailModal.id}`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setTransactionDetails(data);
                setNewStatus(data.status || "");
            } catch (error) {
                console.error("There was a problem with the fetch operation:", error);
                toast.error("Failed to load transaction details");
            } finally {
                setIsLoading(false);
            }
        };

        if (viewDetailModal.show && viewDetailModal.id) {
            fetchTransactionDetails();
        }
    }, [viewDetailModal.show, viewDetailModal.id]);

    const handleClose = () => {
        setViewDetailModal({ show: false, id: "" });
        setNewStatus("");
        setUpdatingStatus(false);
        setProcessing(false);
    };

    const handleStatusUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingStatus(true);
        try {
            const response = await fetch(
                route("admin.a2c-transactions.update", {
                    transaction: viewDetailModal.id,
                }),
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            toast.success("Status updated successfully");
            setTransactionDetails({ ...transactionDetails, status: newStatus });
        } catch (error) {
            toast.error("Failed to update status");
            console.error(error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const response = await fetch(
                route("admin.a2c-transactions.fetch-status", {
                    transaction: viewDetailModal.id,
                }),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            toast.success(data.message || "Status updated successfully");
            handleClose();
        } catch (error) {
            toast.error("Failed to fetch status");
            console.error(error);
        } finally {
            setProcessing(false);
        }
    };

    const DetailItem = ({ label, value }: { label: string; value?: string | number }) => (
        <div className="mb-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
            <p className="text-sm text-gray-900 dark:text-white font-medium">{value || "Loading..."}</p>
        </div>
    );

    return (
        <Dialog open={viewDetailModal.show} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] sm:max-h-96 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Transaction Details</DialogTitle>
                    <DialogDescription>View and update transaction information</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-600 dark:text-gray-400" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Transaction Info */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Amount" value={`₦${transactionDetails.amount}`} />
                                    <DetailItem label="Phone Number" value={transactionDetails.phone_number} />
                                    <DetailItem label="Network" value={transactionDetails.network} />
                                    <DetailItem label="Quantity" value={transactionDetails.quantity} />
                                    <DetailItem label="Status" value={transactionDetails.status} />
                                    <DetailItem label="Transaction Date" value={transactionDetails.date} />
                                    <DetailItem label="Success Count" value={transactionDetails.success} />
                                    <DetailItem label="Failed Count" value={transactionDetails.failed} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Update Status Form */}
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-base font-semibold mb-4">Update Status</h3>
                                <form onSubmit={handleStatusUpdate} className="space-y-3">
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="transferred">Transferred</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        type="submit"
                                        disabled={updatingStatus}
                                        className="w-full gap-2"
                                    >
                                        {updatingStatus && <RefreshCw className="h-4 w-4 animate-spin" />}
                                        Update Status
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Transfer to Wallet */}
                        {transactionDetails.status === "completed" && (
                            <Card>
                                <CardContent className="pt-6">
                                    <h3 className="text-base font-semibold mb-4">Transfer to Wallet</h3>
                                    <form onSubmit={handleSubmit}>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full gap-2"
                                        >
                                            {processing && <RefreshCw className="h-4 w-4 animate-spin" />}
                                            Fetch Status
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* API Response */}
                        {transactionDetails.api_response && (
                            <Card>
                                <CardContent className="pt-6">
                                    <h3 className="text-base font-semibold mb-3">API Response</h3>
                                    <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto border">
                                        {transactionDetails.api_response}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ViewDetailModal;
