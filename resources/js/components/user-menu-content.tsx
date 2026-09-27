import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, Settings, Shield, User as UserIcon } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { auth, is_impersonating } = usePage<any>().props;

    const isAdmin = Boolean(
        auth?.isAdmin ||
        auth?.isSuperAdmin ||
        auth?.isMaster ||
        user?.role === 'admin' ||
        user?.role === 'Admin' ||
        user?.role === 'Superadmin' ||
        user?.role === 'Masteradmin'
    );

    const inAdminArea = typeof window !== 'undefined' ? window.location.pathname.startsWith('/admin') : false;

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} showName={false} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                {inAdminArea ? (
                    <DropdownMenuItem asChild>
                        <Link className="block w-full font-medium" href={route('dashboard')} as="button" onClick={cleanup}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            Go to User Account
                        </Link>
                    </DropdownMenuItem>
                ) : isAdmin ? (
                    <DropdownMenuItem asChild>
                        <Link className="block w-full font-medium" href={route('admin.dashboard')} as="button" onClick={cleanup}>
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                        </Link>
                    </DropdownMenuItem>
                ) : null}

                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('user-settings.profile')} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {Boolean(usePage<any>().props.is_impersonating || usePage<any>().props.auth?.is_impersonating) && (
                <>
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full text-amber-600 dark:text-amber-400 font-semibold"
                            method="post"
                            href={route('impersonate.leave')}
                            as="button"
                            onClick={cleanup}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Return to Admin
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </>
            )}
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
