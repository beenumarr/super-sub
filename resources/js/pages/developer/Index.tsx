import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import DeveloperSettingsLayout from '@/layouts/developer/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Account Information',
        href: '/developer',
    },
];

export default function Profile() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <DeveloperSettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="View your account details" />

                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <h3 className="text-sm font-medium">Name</h3>
                            <p className="text-muted-foreground text-sm">{auth.user.name}</p>
                        </div>

                        <div className="grid gap-2">
                            <h3 className="text-sm font-medium">Email address</h3>
                            <p className="text-muted-foreground text-sm">{auth.user.email}</p>
                        </div>

                        {auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground text-sm">Your email address is unverified.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DeveloperSettingsLayout>
        </AppLayout>
    );
}
