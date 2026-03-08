import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarMenuButton, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { SharedData, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';
import { Bell, ChevronsUpDown } from 'lucide-react';
import DarkModeTogle from './dark-mode';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { UserInfo } from './user-info';
import { UserMenuContent } from './user-menu-content';

interface AppSidebarHeaderProps {
    breadcrumbs?: BreadcrumbItemType[];
    announcement?: {
        enabled: boolean;
        hasNew: boolean;
        title: string;
        content: string;
    };
    onShowAnnouncement?: () => void;
}

export function AppSidebarHeader({ breadcrumbs = [], announcement, onShowAnnouncement }: AppSidebarHeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="ml-auto flex items-center gap-2">
                {/* Notification Bell */}
                {announcement?.enabled && (
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button variant="ghost" size="icon" className="group relative h-9 w-9 cursor-pointer" onClick={onShowAnnouncement}>
                                    <Bell className="h-4 w-4 opacity-80 group-hover:opacity-100" />
                                    {announcement.hasNew && (
                                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{announcement.hasNew ? 'New announcement available!' : 'View announcements'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                <DarkModeTogle />

                <div className="ml-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton size="lg" className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group">
                                <UserInfo showName={!isMobile} user={auth.user} />
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            align="end"
                            side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                        >
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
