import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import AirtimeDiscount from './Components/AirtimeService';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Service Discounts', href: '/admin/service-discounts' },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Discounts" />

            <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-6">
                <div className="mb-6 space-y-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Service Discounts</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Manage service discounts for different mobile networks
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <AirtimeDiscount />
                </div>
            </div>
        </AppLayout>
    );
}
