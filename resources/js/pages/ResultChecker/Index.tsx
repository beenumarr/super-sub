import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Loader2, BookOpen, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ExamType {
    id: string;
    name: string;
    amount: number;
    active: boolean;
}

interface ResultCheckerProps {
    exam_types: ExamType[];
}

const QUANTITY_OPTIONS = [
    { name: '1', value: 1 },
    { name: '2', value: 2 },
    { name: '3', value: 3 },
    { name: '4', value: 4 },
    { name: '5', value: 5 },
    { name: '10', value: 10 },
];

export default function ResultChecker({ exam_types }: ResultCheckerProps) {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
    const [transactionMessage, setTransactionMessage] = useState<string>('');

    const { data, setData, post, processing, errors, reset } = useForm({
        exam_type_id: '',
        quantity: 1,
        amount: 0,
        pins: [],
    });

    const selectedExam = exam_types.find(exam => exam.id.toString() === data.exam_type_id);
    const totalAmount = data.quantity * (selectedExam?.amount || 0);

    const handleExamChange = (examId: string) => {
        const exam = exam_types.find(e => e.id.toString() === examId);
        if (exam) {
            setData({
                ...data,
                exam_type_id: examId,
                amount: exam.amount,
            });
        }
    };

    const handleNextClick = () => {
        if (!data.exam_type_id || !data.quantity) {
            toast.error('Please select an exam type and quantity');
            return;
        }

        setConfirmDialogOpen(true);
    };

    const handleSubmit = () => {
        setTransactionStatus('processing');

        post(route('result_checker.store'), {
            onSuccess: () => {
                setTransactionStatus('success');
                setTransactionMessage('Exam PIN purchased successfully!');
                reset();
                setTimeout(() => {
                    setConfirmDialogOpen(false);
                    setTransactionStatus('initial');
                }, 2000);
            },
            onError: (errs: any) => {
                setTransactionStatus('error');
                if (errs.amount) {
                    setTransactionMessage('Insufficient balance');
                } else {
                    setTransactionMessage(Object.values(errs).flat().join(', '));
                }
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Exam Result Checker" />

            <div className="mx-auto w-full max-w-2xl px-4 py-10">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6" />
                            Exam Result Checker
                        </CardTitle>
                        <CardDescription>
                            Check your exam results using this service
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Exam Type Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Select Exam *</Label>
                            <RadioGroup value={data.exam_type_id} onValueChange={handleExamChange}>
                                <div className="space-y-2">
                                    {exam_types.map((exam) => (
                                        <div key={exam.id} className={`flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition ${
                                            data.exam_type_id === exam.id.toString() ? 'border-2 border-theme-1' : 'border border-gray-200 dark:border-gray-700'
                                        }`}>
                                            <RadioGroupItem value={exam.id.toString()} id={exam.id.toString()} />
                                            <Label htmlFor={exam.id.toString()} className="flex-1 cursor-pointer font-normal">
                                                <div className="font-medium">{exam.name}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">₦{exam.amount.toLocaleString()} per PIN</div>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                            {errors.exam_type_id && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.exam_type_id}</p>
                            )}
                        </div>

                        {/* Quantity Selection */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Quantity *</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {QUANTITY_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setData('quantity', option.value)}
                                        className={`px-3 py-2 rounded-lg border-2 font-medium transition text-sm ${
                                            data.quantity === option.value
                                                ? 'border-theme-1 bg-accent/40 text-theme-1'
                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-theme-1/50'
                                        }`}
                                    >
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                            {errors.quantity && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>
                            )}
                        </div>

                        {/* Amount Summary */}
                        {totalAmount > 0 && (
                            <div className="rounded-lg bg-accent/40 p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Unit Price:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        ₦{(selectedExam?.amount || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {data.quantity}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold">
                                    <span>Total Amount:</span>
                                    <span className="text-lg text-theme-1">₦{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        {/* Action Button */}
                        <Button
                            onClick={handleNextClick}
                            disabled={!data.exam_type_id || !data.quantity}
                            className="w-full gap-2 bg-theme-1 hover:bg-theme-1/90 text-white"
                            size="lg"
                        >
                            Next
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Purchase</DialogTitle>
                        <DialogDescription>
                            Please review the details before confirming
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {transactionStatus === 'initial' && (
                            <>
                                <div className="space-y-3">
                                    <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-600 dark:text-gray-400">Exam Type:</span>
                                        <span className="font-medium">{selectedExam?.name}</span>
                                    </div>
                                    <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                                        <span className="font-medium">{data.quantity}</span>
                                    </div>
                                    <div className="flex justify-between bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                                        <span className="text-gray-600 dark:text-gray-400">Unit Price:</span>
                                        <span className="font-medium">₦{(selectedExam?.amount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold">
                                        <span>Total Amount:</span>
                                        <span className="text-lg text-theme-1">₦{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {transactionStatus === 'processing' && (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-theme-1" />
                                <p className="text-center text-gray-600 dark:text-gray-400">Processing...</p>
                            </div>
                        )}

                        {transactionStatus === 'success' && (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                                <p className="text-center font-medium text-green-600 dark:text-green-400">
                                    {transactionMessage}
                                </p>
                            </div>
                        )}

                        {transactionStatus === 'error' && (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                                <p className="text-center font-medium text-red-600 dark:text-red-400">
                                    {transactionMessage}
                                </p>
                            </div>
                        )}
                    </div>

                    {transactionStatus === 'initial' && (
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setConfirmDialogOpen(false)}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={processing} className="gap-2 bg-theme-1 hover:bg-theme-1/90 text-white">
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm'
                                )}
                            </Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
