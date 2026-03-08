import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import WebhookManager from '@/components/webhook-manager';
import AppLayout from '@/layouts/app-layout';
import DeveloperSettingsLayout from '@/layouts/developer/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Developer',
        href: '/developer/webhook',
    },
];

export default function Webhook({ webhookUrl }: { webhookUrl: string | null }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Webhook Settings" />
            <DeveloperSettingsLayout>
                <WebhookManager existingWebhookUrl={webhookUrl} />
            </DeveloperSettingsLayout>
        </AppLayout>
    );
}
