import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import ApiKeyManager from '@/components/generate-api-key';
import AppLayout from '@/layouts/app-layout';
import DeveloperSettingsLayout from '@/layouts/developer/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Developer',
        href: '/developer/api-key',
    },
];

export default function Profile({ token }: { token: string }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Developer" />
            <DeveloperSettingsLayout>
                <ApiKeyManager existingApiKey={token} />
            </DeveloperSettingsLayout>
        </AppLayout>
    );
}
