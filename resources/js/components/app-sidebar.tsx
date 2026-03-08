import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
// import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { FileText, GraduationCap, HelpCircle, LayoutDashboard, List, Phone, Settings, Signal, Tv, Wallet, Zap } from 'lucide-react';
import AppLogoIcon from './app-logo-icon';

const mainNavItems: NavItem[] = [
    // Main
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Fund Wallet',
        href: '/funding',
        icon: Wallet,
    },
    {
        title: 'Transactions History',
        href: '/transactions',
        icon: FileText,
    },
    {
        title: '',
        href: '',
        divider: true,
    },
    // Services
    {
        title: 'Buy Data',
        href: '/buy_data',
        icon: Signal,
    },
    {
        title: 'Buy Airtime',
        href: '/buy_airtime',
        icon: Phone,
    },
    {
        title: 'TV Subscription',
        href: '/cable_subscriptions',
        icon: Tv,
    },
    {
        title: 'Electricity Bill',
        href: '/electricity_bill_payments',
        icon: Zap,
    },
    {
        title: 'Education Pin',
        href: '/result_checker',
        icon: GraduationCap,
    },
    // {
    //     title: 'Kirani Minutes',
    //     href: '/kirani',
    //     icon: Wifi,
    // },
    // {
    //     title: 'Smile',
    //     href: '/smile',
    //     icon: Phone,
    // },
    {
        title: '',
        href: '',
        divider: true,
    },
    // Others
    // {
    //     title: 'Referral',
    //     href: '/referrals',
    //     icon: Gift,
    // },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },

    {
        title: '',
        href: '',
        divider: true,
    },
    // More
    // {
    //     title: 'Developer API',
    //     href: '/developer',
    //     icon: Code,
    // },
    {
        title: 'Support',
        href: '/#footer',
        icon: HelpCircle,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'API Documentation',
        href: '/api-documentation',
        icon: List,
    },
];

export function AppSidebar() {
    const features = usePage<SharedData>().props.auth.features;
    const system_configuration_features = usePage<SharedData>().props.system_configuration.features;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="bg-sidebar-primary/5" size="lg" asChild>
                            <AppLogoIcon />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} features={features} system_configuration_features={system_configuration_features} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                {/* <NavUser /> */}
            </SidebarFooter>
        </Sidebar>
    );
}
