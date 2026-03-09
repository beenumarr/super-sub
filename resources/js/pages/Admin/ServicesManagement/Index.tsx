import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import APIs from './Components/Apis';
import DataAndAirtimeService from './Components/DataAndAirtimeService';
import UtilityServices from './Components/UtilityServices';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Services Management', href: '/admin/services-management' },
];

interface ServicesManagementIndexProps {
    isStl?: boolean;
    can_add_api?: boolean;
}

export default function Index({ isStl, can_add_api }: ServicesManagementIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services Management" />
            <div className="mx-auto w-full max-w-6xl">
                <DataAndAirtimeService />
                <UtilityServices />

                {isStl && <APIs can_add_api={can_add_api} />}
            </div>
        </AppLayout>
    );
}
