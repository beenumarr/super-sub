import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';

interface Props {
    meta: {
        ip: string | null;
        user_agent: string | null;
        session_id: string;
        location?: {
            country?: string | null;
            city?: string | null;
        } | null;
    };
}

export default function Deactivated({ meta }: Props) {
    return (
        <>
            <Head title="Account Deactivated" />
            <div className="mx-auto w-full max-w-3xl px-4 pt-16 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Deactivated</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-600">
                            Your account has been deactivated for violation of policy or suspicious activity. If you believe this is a mistake, please
                            contact support.
                        </p>

                        <div className="flex flex-col gap-2">
                            <span className="text-gray-500"> support@vtuapp.com.ng</span>
                            <span className="text-gray-500"> +2348164779252</span>
                        </div>

                        <div className="bg-muted rounded-md p-4">
                            <h3 className="mb-2 text-sm font-semibold">Current Session</h3>
                            <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                <div>
                                    <span className="text-gray-500">IP Address:</span>
                                    <div className="font-mono">{meta.ip ?? 'Unknown'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Session ID:</span>
                                    <div className="font-mono break-all">{meta.session_id}</div>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-gray-500">Client:</span>
                                    <div className="font-mono break-words">{meta.user_agent ?? 'Unknown'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Approx. Location:</span>
                                    <div>{meta.location?.country ?? 'Unknown'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Link href={route('logout')} method="post" as="button">
                                <Button variant="destructive">Logout</Button>
                            </Link>
                        </div>

                        <div className="pt-4 text-sm text-gray-600">
                            <div className="flex flex-wrap items-center gap-3">
                                <Link href={route('privacy-policy')} className="underline hover:text-gray-800">
                                    Privacy Policy
                                </Link>
                                <span>•</span>
                                <Link href={route('terms-of-use')} className="underline hover:text-gray-800">
                                    Terms of Use
                                </Link>
                                <span>•</span>
                                <Link href={route('home')} data-anchor="footer" className="underline hover:text-gray-800">
                                    Back to Homepage Footer
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
