import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Forbidden',
        href: '#',
    },
];

export default function Forbidden() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Access Denied" />
            <div className="flex min-h-[60vh] flex-col items-center justify-center py-16">
                <div className="mb-8 text-red-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-24 w-24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h1 className="mb-4 text-3xl font-bold">Access Denied</h1>
                <p className="mb-8 max-w-md text-center text-gray-500">
                    You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
                </p>
                <div className="flex gap-4">
                    <Link href={route('dashboard')}>
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                    <Link href={route('home')}>
                        <Button>Go Home</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
