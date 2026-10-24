import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SharedData } from '@/types';
import { applyMonnifyCharges } from '@/utils';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Monnify from 'monnify-ts';
import { useState } from 'react';
import toast from 'react-hot-toast';

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
        monnify_funding_charges?: string;
        monnify_api_key?: string;
        monnify_contract_code?: string;
        monnify_service?: boolean;
        zainpay_service?: boolean;
        zainpay_funding_charges?: string;
    };
}

export default function CardFundingForm({ formModal, setFormModal }: CardFundingFormProps) {
    const { auth, config } = usePage<SharedData>().props as unknown as PageProps;

    const monnifyEnabled = config?.monnify_service ?? true;
    const zainpayEnabled = Boolean(config?.zainpay_service);

    const initialGateway = zainpayEnabled && !monnifyEnabled ? 'zainpay' : 'monnify';
    const [gateway, setGateway] = useState<'monnify' | 'zainpay'>(initialGateway);
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const currentChargesConfig =
        gateway === 'zainpay'
            ? config?.zainpay_funding_charges || '1.6 %'
            : config?.monnify_funding_charges || '1.6 %';

    const numericAmount = Number(amount) || 0;
    const charges = applyMonnifyCharges(numericAmount, currentChargesConfig);
    const total = numericAmount > 0 ? numericAmount + Number(charges || 0) : 0;

    const handleClose = () => {
        setFormModal(false);
        setAmount('');
        setLoading(false);
    };

    const handleSuccess = () => router.reload();

    const handleContinue = async () => {
        if (!numericAmount || numericAmount < 100) return;

        if (gateway === 'zainpay') {
            setLoading(true);
            try {
                const response = await axios.post('/wallet/zainpay/initialize', {
                    amount: numericAmount,
                });
                if (response.data && response.data.checkout_url) {
                    window.location.href = response.data.checkout_url;
                } else {
                    toast.error('Unable to retrieve payment link from Zainpay.');
                    setLoading(false);
                }
            } catch (error: any) {
                setLoading(false);
                const msg = error?.response?.data?.message || 'Failed to initialize payment with Zainpay.';
                toast.error(msg);
            }
        } else {
            payWithMonnify(
                {
                    name: auth.user.name,
                    email: auth.user.email,
                    id: auth.user.id,
                    amount: numericAmount,
                },
                handleSuccess,
                config?.monnify_api_key || '',
                config?.monnify_contract_code || '',
                charges,
            );
        }
    };

    const hasBothGateways = monnifyEnabled && zainpayEnabled;

    return (
        <Dialog
            open={formModal}
            onOpenChange={(open) => {
                if (!open && !loading) handleClose();
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Card / Online Funding</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {hasBothGateways && (
                        <div className="space-y-1">
                            <Label className="text-sm font-medium">Select Payment Gateway</Label>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setGateway('monnify')}
                                    className={`rounded-md border p-2.5 text-center text-sm font-medium transition ${
                                        gateway === 'monnify'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    Monnify
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGateway('zainpay')}
                                    className={`rounded-md border p-2.5 text-center text-sm font-medium transition ${
                                        gateway === 'zainpay'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border text-muted-foreground hover:bg-muted'
                                    }`}
                                >
                                    Zainpay
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="funding-amount" className="text-sm font-medium">
                            Enter Amount
                        </Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-gray-500">
                                ₦
                            </span>
                            <Input
                                id="funding-amount"
                                type="number"
                                name="amount"
                                placeholder="500"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-8"
                                min={100}
                                disabled={loading}
                            />
                        </div>
                        {numericAmount > 0 && numericAmount < 100 && (
                            <p className="text-xs text-red-500">Minimum funding amount is ₦100.</p>
                        )}
                    </div>

                    <div className="rounded-md bg-muted/50 p-3 text-sm text-foreground space-y-1">
                        <p className="flex justify-between">
                            <span className="text-muted-foreground">Charges:</span>
                            <span className="font-semibold">₦{numericAmount ? Number(charges || 0) : 0}</span>
                        </p>
                        <p className="flex justify-between border-t pt-1">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-semibold text-primary">₦{total}</span>
                        </p>
                    </div>
                </div>

                <DialogFooter className="mt-2 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleContinue}
                        disabled={loading || !numericAmount || numericAmount < 100}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
