import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
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

export default ({ children, breadcrumbs, announcement, onShowAnnouncement, ...props }: AppLayoutProps) => {
    const { auth, is_impersonating } = usePage<any>().props;
    const isImpersonating = Boolean(is_impersonating ?? auth?.is_impersonating);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {isImpersonating && (
                <div className="sticky top-0 z-[100] flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-md">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>
                            Impersonation Mode: Currently viewing as <strong className="underline underline-offset-2">{auth?.user?.name || 'User'}</strong> ({auth?.user?.email})
                        </span>
                    </div>
                    <Link
                        href={route('impersonate.leave')}
                        method="post"
                        as="button"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 hover:bg-black/60 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition active:scale-95"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Return to Admin
                    </Link>
                </div>
            )}

            <AppLayoutTemplate breadcrumbs={breadcrumbs} announcement={announcement} onShowAnnouncement={onShowAnnouncement} {...props}>
                {children}
            </AppLayoutTemplate>

            <Toaster position="top-right" />
        </div>
    );
};
