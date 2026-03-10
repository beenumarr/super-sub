import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import KycBvnForm from './Partials/KycBvnForm';

export default function Bvn() {
    return (
        <AppLayout breadcrumbs={[{ title: 'KYC - BVN', href: '/kyc/bvn' }]}>
            <Head title="User KYC - BVN" />

            <div className="px-4 py-8 lg:px-0">
                <div className="mx-auto max-w-xl space-y-4">
                    <Link
                        href="/kyc"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to KYC options</span>
                    </Link>

                    <KycBvnForm className="bg-white dark:bg-slate-900" />
                </div>
            </div>
        </AppLayout>
    );
}

