import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ApiTest({ clientDeviceId }: { clientDeviceId: string }) {
    const phoneForm = useForm({
        msisdn: '08084662186',
    });

    const otpForm = useForm({
        otp: '',
        otpId: '',
        clientDeviceId: '',
    });

    const sendDataForm = useForm({
        msisdn: '08084662186',
    });

    // Request OTP handler
    const handleRequestOTP = (e: React.FormEvent) => {
        e.preventDefault();

        phoneForm.post(route('api-test.request-otp'), {
            onSuccess: () => {
                toast.success('OTP sent successfully');
            },
        });
    };

    // Verify OTP handler
    const handleVerifyOTP = (e: React.FormEvent) => {
        e.preventDefault();

        otpForm.post(route('api-test.verify-otp'), {
            onSuccess: () => {
                toast.success('OTP verified successfully');
            },
        });
    };

    const handleSendData = (e: React.FormEvent) => {
        e.preventDefault();

        sendDataForm.post(route('api-test.send-data'), {
            onSuccess: () => {
                toast.success('Data sent successfully');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Add Phone Number" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Phone Number</CardTitle>
                            <CardDescription>Add a new phone number to your account in just a few steps</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleRequestOTP}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        type="text"
                                        value={phoneForm.data.msisdn}
                                        onChange={(e) => phoneForm.setData('msisdn', e.target.value)}
                                        placeholder="Enter your phone number"
                                        required
                                    />
                                    <InputError message={phoneForm.errors.msisdn} />
                                </div>

                                <div className="pt-4">
                                    <Button className="bg-theme-1 w-full text-white" type="submit" disabled={phoneForm.processing}>
                                        {phoneForm.processing ? 'Sending OTP...' : 'Send OTP'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <form onSubmit={handleVerifyOTP}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp">OTP</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        value={otpForm.data.otp}
                                        onChange={(e) => otpForm.setData('otp', e.target.value)}
                                        placeholder="Enter your OTP"
                                        required
                                    />
                                    <InputError message={otpForm.errors.otp} />
                                </div>

                                <div className="pt-4">
                                    <Button className="bg-theme-1 w-full text-white" type="submit" disabled={otpForm.processing}>
                                        {otpForm.processing ? 'Verifying OTP...' : 'Verify OTP'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <form onSubmit={handleSendData}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="msisdn">Phone Number</Label>
                                    <Input
                                        id="msisdn"
                                        type="text"
                                        value={sendDataForm.data.msisdn}
                                        onChange={(e) => sendDataForm.setData('msisdn', e.target.value)}
                                        placeholder="Enter Phone Number"
                                        required
                                    />
                                    <InputError message={otpForm.errors.otp} />
                                </div>

                                <div className="pt-4">
                                    <Button className="bg-theme-1 w-full text-white" type="submit" disabled={sendDataForm.processing}>
                                        {sendDataForm.processing ? 'Sending Data...' : 'Send Data'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
