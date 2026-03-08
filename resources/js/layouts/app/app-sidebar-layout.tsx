import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

interface AppSidebarLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
    announcement?: {
        enabled: boolean;
        hasNew: boolean;
        title: string;
        content: string;
    };
    onShowAnnouncement?: () => void;
}

export default function AppSidebarLayout({ children, breadcrumbs = [], announcement, onShowAnnouncement }: PropsWithChildren<AppSidebarLayoutProps>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} announcement={announcement} onShowAnnouncement={onShowAnnouncement} />
                {children}
            </AppContent>

            {/* Floating WhatsApp */}
            {/* <a
                href={`https://wa.me/2348084662186`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="fixed right-6 bottom-15 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition hover:brightness-95"
            >
                <MessageCircle className="h-5 w-5" />
                <span className="hidden sm:inline">WhatsApp</span>
            </a> */}
        </AppShell>
    );
}
