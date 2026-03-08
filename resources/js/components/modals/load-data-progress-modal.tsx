import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap } from 'lucide-react';

interface LoadDataProgress {
    status: 'starting' | 'processing' | 'completed' | 'failed';
    total: number;
    processed: number;
    successful: number;
    failed: number;
}

interface LoadDataProgressModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loadDataProgress: LoadDataProgress | null;
}

export default function LoadDataProgressModal({ open, onOpenChange, loadDataProgress }: LoadDataProgressModalProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={(open) => {
                // Only allow closing via the close button, not by clicking outside
                // This prevents accidental closing during operations
                if (!open) {
                    // Don't close the modal when clicking outside
                    return;
                }
                onOpenChange(open);
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Loading Data</DialogTitle>
                    <DialogDescription>Please wait while we load data for your selected phone numbers.</DialogDescription>
                </DialogHeader>

                {loadDataProgress && (
                    <div className="space-y-4">
                        {/* Progress Counter */}
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {loadDataProgress.processed} of {loadDataProgress.total}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Phone numbers processed</div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>
                                    {loadDataProgress.total > 0 ? Math.round((loadDataProgress.processed / loadDataProgress.total) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className="h-3 rounded-full bg-blue-600 transition-all duration-300"
                                    style={{
                                        width: `${loadDataProgress.total > 0 ? (loadDataProgress.processed / loadDataProgress.total) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Status Details */}
                        <div className="grid grid-cols-2 gap-4 rounded-md border p-3 dark:border-gray-700">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-green-600">{loadDataProgress.successful}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Successful</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-red-600">{loadDataProgress.failed}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
                            </div>
                        </div>

                        {/* Status Message */}
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <Zap
                                    className={`h-4 w-4 text-blue-600 ${loadDataProgress?.status === 'starting' || loadDataProgress?.status === 'processing' ? 'animate-pulse' : ''}`}
                                />
                                <span className="text-sm font-medium">
                                    {loadDataProgress.status === 'completed'
                                        ? 'Completed'
                                        : loadDataProgress.status === 'failed'
                                          ? 'Failed'
                                          : loadDataProgress.status === 'starting'
                                            ? 'Starting...'
                                            : 'Processing...'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loadDataProgress?.status === 'processing' || loadDataProgress?.status === 'starting'}
                    >
                        {loadDataProgress?.status === 'processing' || loadDataProgress?.status === 'starting' ? 'Please Wait...' : 'Close'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
