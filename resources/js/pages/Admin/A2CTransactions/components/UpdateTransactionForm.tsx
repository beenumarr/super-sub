import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface TransactionableData {
    token?: string;
}

interface EditData {
    id: number;
    amount: string;
    description: string;
    status: string;
    api_response: string;
    balance_before: string;
    balance_after: string;
    updatable: boolean;
    transactionable?: TransactionableData;
}

interface UpdateTransactionFormProps {
    editData: EditData;
    handleClose: () => void;
}

function UpdateTransactionForm({ editData, handleClose }: UpdateTransactionFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        status: editData.status ?? "",
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(
            route("admin.transactions.update", {
                transaction: editData.id,
            }),
            {
                onSuccess: () => {
                    toast.success("Transaction Updated Successfully");
                    handleClose();
                },
                onError: (errors) => {
                    Object.values(errors).flat().forEach((err: any) => {
                        toast.error(err);
                    });
                },
            }
        );
    };

    const DetailRow = ({ label, value, children }: { label: string; value?: string | number; children?: React.ReactNode }) => (
        <div className="flex items-start gap-4 py-3">
            <label className="w-1/3 text-sm font-medium text-gray-600 dark:text-gray-400">{label}</label>
            <div className="w-2/3">{children || <p className="text-sm text-gray-900 dark:text-white">{value}</p>}</div>
        </div>
    );

    return (
        <form onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Transaction Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <DetailRow label="Amount" value={`₦${editData.amount}`} />
                    <DetailRow label="Description" value={editData.description} />

                    {editData.transactionable?.token && (
                        <DetailRow label="Token" value={editData.transactionable.token} />
                    )}

                    <DetailRow label="Status">
                        {editData.updatable ? (
                            <Select value={data.status} onValueChange={(val) => setData("status", val)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="transferred">Transferred</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm font-medium uppercase text-gray-900">{editData.status}</p>
                        )}
                    </DetailRow>

                    <DetailRow label="API Response" value={editData.api_response} />

                    <div className="border-t dark:border-gray-800 my-4" />

                    <div className="grid grid-cols-2 gap-4">
                        <DetailRow label="Balance Before" value={`₦${editData.balance_before}`} />
                        <DetailRow label="Balance After" value={`₦${editData.balance_after}`} />
                    </div>
                </CardContent>
            </Card>

            {editData.updatable && (
                <div className="flex justify-end gap-2 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing} className="gap-2">
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Update Transaction
                    </Button>
                </div>
            )}
        </form>
    );
}

export default UpdateTransactionForm;
