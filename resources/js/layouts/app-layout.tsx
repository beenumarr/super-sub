import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    announcement?: {
        enabled: boolean;
        hasNew: boolean;
        title: string;
        content: string;
    };
    onShowAnnouncement?: () => void;
}

export default ({ children, breadcrumbs, announcement, onShowAnnouncement, ...props }: AppLayoutProps) => (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <AppLayoutTemplate breadcrumbs={breadcrumbs} announcement={announcement} onShowAnnouncement={onShowAnnouncement} {...props}>
            {children}
        </AppLayoutTemplate>

        <Toaster position="top-right" />
    </div>
);
