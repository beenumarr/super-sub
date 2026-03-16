import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function AdminAuthenticatedLayout({ title = 'Admin', children, ...props }) {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        ...(title ? [{ title, href: '#' }] : []),
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} {...props}>
            <Head title={title} />
            {children}
        </AppLayout>
    );
}
