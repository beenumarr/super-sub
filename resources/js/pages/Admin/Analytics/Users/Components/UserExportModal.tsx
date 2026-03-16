import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

interface UserExportModalProps {
    setFormModal: (value: boolean) => void;
    formModal: boolean;
    processing: boolean;
    fileUrl: string;
}

const UserExportModal = ({
    setFormModal,
    formModal,
    processing,
    fileUrl,
}: UserExportModalProps) => {
    return (
        <Dialog open={formModal} onOpenChange={setFormModal}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>User Export</DialogTitle>
                </DialogHeader>
                <div className="text-center py-8">
                    {processing ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Processing export...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <Check className="h-8 w-8 text-green-500 dark:text-green-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Users exported successfully
                            </p>
                            <Button
                                asChild
                                className="mt-4 gap-2"
                            >
                                <a href={fileUrl}>Download</a>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UserExportModal;
