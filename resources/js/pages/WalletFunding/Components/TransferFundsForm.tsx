import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

declare const axios: any;

interface TransferFundsFormProps {
    transferModal: boolean;
    setTransferModal: (open: boolean) => void;
    a2cBalance: number;
    walletBalance: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
}

export default function TransferFundsForm({
    transferModal,
    setTransferModal,
    a2cBalance,
    walletBalance, // kept for future use if needed
    user,
}: TransferFundsFormProps) {
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [transferType, setTransferType] = useState<'main-wallet' | 'bank-account'>('main-wallet');

    useEffect(() => {
        if (!transferModal) {
            setAmount('');
            setError('');
            setTransferType('main-wallet');
        }
    }, [transferModal]);

    const handleClose = () => {
        setTransferModal(false);
        setAmount('');
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const numericAmount = parseFloat(amount);

        if (!numericAmount || numericAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (numericAmount > a2cBalance) {
            setError('Amount exceeds your A2C wallet balance');
            return;
        }

        if (transferType === 'bank-account') {
            if (!user.bank_account_bank_code || !user.bank_account_number) {
                setError('Missing bank details. Please update your profile.');
                return;
            }

            if (numericAmount < 1000) {
                setError('Minimum withdrawal amount is ₦1,000');
                return;
            }
        }

        setProcessing(true);

        try {
            let response;
            if (transferType === 'main-wallet') {
                response = await axios.post('/airtime_to_cash/transfer-to-wallet', {
                    amount: numericAmount,
                    wallet_type: 'wallet-balance',
                });
            } else {
                response = await axios.post('/airtime_to_cash/withdraw-to-bank', {
                    amount: numericAmount,
                    bank_code: user.bank_account_bank_code,
                    account_number: user.bank_account_number,
                    account_name: user.bank_account_name,
                });
            }

            const successMessage =
                transferType === 'main-wallet'
                    ? 'Funds transferred to main wallet successfully'
                    : 'Withdrawal request submitted successfully';

            toast.success(response?.data?.message || successMessage);
            setAmount('');
            setTransferModal(false);
            router.reload();
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message || 'Operation failed. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog
            open={transferModal}
            onOpenChange={(open) => {
                if (!open && !processing) {
                    handleClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Transfer A2C Funds</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Transfer type */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Transfer Type
                        </Label>
                        <RadioGroup
                            className="flex gap-4"
                            value={transferType}
                            onValueChange={(v) =>
                                setTransferType(v as 'main-wallet' | 'bank-account')
                            }
                        >
                            <Label className="flex items-center gap-2 text-sm">
                                <RadioGroupItem value="main-wallet" />
                                <span>Transfer to Main Wallet</span>
                            </Label>
                            <Label className="flex items-center gap-2 text-sm">
                                <RadioGroupItem value="bank-account" />
                                <span>Withdraw to Bank Account</span>
                            </Label>
                        </RadioGroup>
                    </div>

                    {/* A2C balance */}
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-gray-600 dark:text-gray-300">A2C Wallet Balance</p>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                            ₦{a2cBalance.toLocaleString()}
                        </p>
                    </div>

                    {/* Bank account warning/details */}
                    {transferType === 'bank-account' && (
                        <div>
                            {user.bank_account_bank_code && user.bank_account_number ? (
                                <div className="rounded-md border border-gray-200 p-3 text-sm dark:border-slate-800">
                                    <p className="mb-1 text-gray-600 dark:text-gray-300">
                                        Bank Account Details
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-200">
                                        Account Name:{' '}
                                        <span className="font-semibold">
                                            {user.bank_account_name}
                                        </span>
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-200">
                                        Account Number:{' '}
                                        <span className="font-semibold">
                                            {user.bank_account_number}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <Alert variant="default" className="border-yellow-300 bg-yellow-50">
                                    <AlertDescription>
                                        Please update your bank details in your profile to withdraw
                                        funds.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Amount input */}
                    <div className="space-y-1">
                        <Label htmlFor="transfer-amount">
                            Amount to{' '}
                            {transferType === 'main-wallet' ? 'Transfer' : 'Withdraw'}
                        </Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                                ₦
                            </span>
                            <Input
                                id="transfer-amount"
                                type="number"
                                value={amount}
                                min={0}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-8"
                                placeholder="0.00"
                                disabled={processing}
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {transferType === 'main-wallet'
                                ? 'Enter the amount you want to transfer from A2C to your main wallet.'
                                : 'Minimum withdrawal amount is ₦1,000 from your A2C balance.'}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !amount ||
                                parseFloat(amount) <= 0 ||
                                parseFloat(amount) > a2cBalance ||
                                (transferType === 'bank-account' &&
                                    (parseFloat(amount) < 1000 ||
                                        !user.bank_account_bank_code ||
                                        !user.bank_account_number))
                            }
                        >
                            {processing
                                ? 'Processing...'
                                : transferType === 'main-wallet'
                                  ? 'Transfer'
                                  : 'Withdraw'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

