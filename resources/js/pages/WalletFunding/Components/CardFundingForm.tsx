import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SharedData } from '@/types';
import { applyMonnifyCharges } from '@/utils';
import { router, usePage } from '@inertiajs/react';
import Monnify from 'monnify-ts';
import { useState } from 'react';

interface CardFundingFormProps {
    formModal: boolean;
    setFormModal: (open: boolean) => void;
}

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    config: {
        monnify_funding_charges: string;
        monnify_api_key: string;
        monnify_contract_code: string;
    };
}

export default function CardFundingForm({ formModal, setFormModal }: CardFundingFormProps) {
    const { auth, config } = usePage<SharedData>().props as unknown as PageProps;

    const [amount, setAmount] = useState<string>('');

    const charges = applyMonnifyCharges(Number(amount), config.monnify_funding_charges);
    const numericAmount = Number(amount) || 0;
    const total = numericAmount > 0 ? numericAmount + Number(charges || 0) : 0;

    const handleClose = () => {
        setFormModal(false);
        setAmount('');
    };

    const handleSuccess = () => router.reload();

    const handleContinue = () => {
        if (!numericAmount || numericAmount <= 0) return;

        payWithMonnify(
            {
                name: auth.user.name,
                email: auth.user.email,
                id: auth.user.id,
                amount: numericAmount,
            },
            handleSuccess,
            config.monnify_api_key,
            config.monnify_contract_code,
            charges,
        );
    };

    return (
        <Dialog
            open={formModal}
            onOpenChange={(open) => {
                if (!open) handleClose();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Card Funding</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enter Amount</label>
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-gray-500">₦</span>
                            <Input
                                type="number"
                                name="amount"
                                placeholder="300"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-8"
                                min={0}
                            />
                        </div>
                    </div>

                    <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-700 dark:bg-slate-900 dark:text-gray-200">
                        <p>
                            Charges: <span className="font-semibold">₦{numericAmount ? Number(charges || 0) : 0}</span>
                        </p>
                        <p>
                            Total: <span className="font-semibold">₦{total}</span>
                        </p>
                    </div>
                </div>

                <DialogFooter className="mt-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleContinue} disabled={!numericAmount || numericAmount <= 0}>
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function payWithMonnify(
    data: { name: string; email: string; id: number; amount: number },
    handleSuccess: () => void,
    apiKey: string,
    contractCode: string,
    charges: number,
) {
    const extraCharges = Number(charges || 0);

    const monnify = new Monnify(apiKey, contractCode);

    monnify.initializePayment({
        amount: Number(data.amount) + extraCharges,
        currency: 'NGN',
        reference: String(new Date().getTime()),
        customerFullName: data.name,
        customerEmail: data.email,
        paymentDescription: 'Card Funding',
        apiKey,
        contractCode,
        metadata: {
            name: data.name,
            user_id: data.id,
        },
        onLoadStart: () => {
            // SDK is starting to load
        },
        onLoadComplete: () => {
            // SDK finished loading
        },
        onComplete: function () {
            handleSuccess();
        },
        onClose: function () {
            handleSuccess();
        },
    });
}
