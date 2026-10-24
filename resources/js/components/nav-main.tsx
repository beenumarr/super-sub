import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BadgePercent,
    Bell,
    ChevronDown,
    Cog,
    DollarSign,
    Gift,
    History,
    LayoutDashboard,
    Settings,
    Signal,
    Tv,
    UserCog,
    Users,
    Wallet,
} from 'lucide-react';

const adminMainNavItems: NavItem[] = [
    // Overview
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Transactions',
        href: '/admin/transactions',
        icon: History,
    },
    // {
    //     title: 'Analytics',
    //     href: '/admin/analytics',
    //     icon: BarChart3,
    // },
    {
        title: '',
        href: '',
        divider: true,
    },
    // Products
    {
        title: 'Data Plans',
        href: '/admin/data_plans',
        icon: Signal,
    },

    {
        title: 'Cable TV Plans',
        href: '/admin/cable_subscription_plans',
        icon: Tv,
    },
    {
        title: '',
        href: '',
        divider: true,
    },
    // Services
    {
        title: 'Services Settings',
        href: '/admin/services-management',
        icon: Settings,
    },
    {
        title: 'Discounts',
        href: '/admin/service-discounts',
        icon: BadgePercent,
    },
    {
        title: 'Charges',
        href: '/admin/service-charges',
        icon: DollarSign,
    },
    // {
    //     title: 'Airtime to Cash',
    //     href: '',
    //     icon: Wallet,
    //     submenu: [
    //         {
    //             title: 'Transactions',
    //             href: '/admin/a2c-transactions',
    //         },
    //         {
    //             title: 'Settings',
    //             href: '/admin/airtime2cash-settings',
    //         },
    //     ],
    // },
    // {
    //     title: 'Kirani',
    //     href: '',
    //     icon: Wifi,
    //     submenu: [
    //         {
    //             title: 'Configurations',
    //             href: '/admin/kirani',
    //         },
    //         {
    //             title: 'Plans',
    //             href: '/admin/kirani/plans',
    //         },
    //     ],
    // },
    {
        title: '',
        href: '',
        divider: true,
    },
    // Users
    {
        title: 'All Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Wallet Funding',
        href: '/admin/manual-funding',
        icon: Wallet,
    },
    {
        title: 'Staff',
        href: '',
        icon: UserCog,
        submenu: [
            {
                title: 'Staff List',
                href: '/admin/staffs',
            },
            {
                title: 'Roles',
                href: '/admin/roles',
            },
        ],
    },
    {
        title: '',
        href: '',
        divider: true,
    },
    // Push Notifications
    {
        title: 'Push Notifications',
        href: '',
        icon: Bell,
        submenu: [
            {
                title: 'Broadcast',
                href: '/admin/notifications/broadcast',
            },
            {
                title: 'Firebase Settings',
                href: '/admin/notifications/settings',
            },
        ],
    },
    // Settings
    {
        title: 'Referral & Promo',
        href: '/admin/promo',
        icon: Gift,
    },
    {
        title: 'Configurations',
        href: '/admin/app_configurations',
        icon: Cog,
    },
];

export function NavMain({
    items = [],
    features,
}: {
    items: NavItem[];
    features?: { [key: string]: boolean };
    system_configuration_features?: { [key: string]: boolean };
}) {
    const page = usePage<SharedData>();
    const userFeatures = features || page.props.auth.features;

    const navItems = page.url.includes('/admin/') ? adminMainNavItems : items;

    // Filter navigation items based on user features
    const filteredNavItems = navItems.filter((item) => {
        if (!item.requiredFeature) return true; // Always show items without feature requirement
        return (
            userFeatures && userFeatures[item.requiredFeature] === true

            // ||
            // (systemConfigurationFeatures && systemConfigurationFeatures[item.requiredFeature] === true)
        );
    });

    // Check if current page matches any submenu item
    const isItemActive = (item: NavItem) => {
        if (item.href === page.url) return true;
        if (item.submenu) {
            return item.submenu.some((sub) => sub.href === page.url);
        }
        return false;
    };

    const activeIconClass = 'text-theme-1';
    const inactiveIconClass = 'text-muted-foreground';

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel></SidebarGroupLabel>
            <SidebarMenu key={page.url}>
                {filteredNavItems.map((item, index) => (
                    <div key={item.title || `divider-${index}`}>
                        {item.divider ? (
                            <SidebarSeparator className="my-2" />
                        ) : (
                            <Collapsible defaultOpen={isItemActive(item)} className="group/collapsible">
                                <SidebarMenuItem key={item.title}>
                                    <CollapsibleTrigger className="mb-1 [&[data-state=open]>div>svg]:rotate-180" asChild>
                                        <SidebarMenuButton
                                            size="default"
                                            asChild
                                            isActive={item.href === page.url}
                                            tooltip={{ children: item.title }}
                                        >
                                            {item.submenu ? (
                                                <div className="flex items-center gap-2">
                                                    {item.icon && <item.icon className={isItemActive(item) ? activeIconClass : inactiveIconClass} />}
                                                    <span className={isItemActive(item) ? activeIconClass : inactiveIconClass}>{item.title}</span>

                                                    <ChevronDown
                                                        size={18}
                                                        className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
                                                    />
                                                </div>
                                            ) : (
                                                <Link href={item.href} className="flex items-center gap-2">
                                                    {item.icon && (
                                                        <item.icon className={item.href === page.url ? activeIconClass : inactiveIconClass} />
                                                    )}
                                                    <span className={item.href === page.url ? activeIconClass : inactiveIconClass}>{item.title}</span>
                                                </Link>
                                            )}
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="group-data-[state=closed]/collapsible:animate-collapsible-up group-data-[state=open]/collapsible:animate-collapsible-down overflow-hidden">
                                        {item.submenu &&
                                            item.submenu.map((sub) => {
                                                const isSubActive = sub.href === page.url;
                                                return (
                                                    <SidebarMenuSub key={sub.title}>
                                                        <SidebarMenuItem key={sub.title}>
                                                            <SidebarMenuButton asChild isActive={isSubActive} tooltip={{ children: sub.title }}>
                                                                <Link href={sub.href} className="flex items-center gap-2">
                                                                    {sub.icon && (
                                                                        <sub.icon className={isSubActive ? activeIconClass : inactiveIconClass} />
                                                                    )}
                                                                    <span className={isSubActive ? activeIconClass : inactiveIconClass}>
                                                                        {sub.title}
                                                                    </span>
                                                                </Link>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    </SidebarMenuSub>
                                                );
                                            })}
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        )}
                    </div>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
