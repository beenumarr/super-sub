import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import KycNinForm from './Partials/KycNinForm';

export default function Nin() {
    return (
        <AppLayout breadcrumbs={[{ title: 'KYC - NIN', href: '/kyc/nin' }]}>
            <Head title="User KYC - NIN" />

            <div className="px-4 py-8 lg:px-0">
                <div className="mx-auto max-w-xl space-y-4">
                    <Link
                        href="/kyc"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to KYC options</span>
                    </Link>

                    <KycNinForm className="bg-white dark:bg-slate-900" />
                </div>
            </div>
        </AppLayout>
    );
}

