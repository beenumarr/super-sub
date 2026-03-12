import { LucideIcon } from 'lucide-react';
import { ComponentType } from 'react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    features: {
        feat_airtel_gifting: boolean;
        feat_mtn_gifting: boolean;
        feat_mtn_datashare: boolean;
        feat_glo_gifting: boolean;
        feat_momo_airtime: boolean;
        feat_momo_data: boolean;
        feat_momo_gifting: boolean;
        feat_airtel_smartcash: boolean;
    };
}

export interface BreadcrumbItem {
    title: string;
    href?: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | ComponentType | null;
    isActive?: boolean;
    submenu?: NavItem[];
    requiredFeature?: keyof Auth['features'];
    divider?: boolean;
}

export interface SystemConfiguration {
    features: {
        feat_airtel_gifting: boolean;
        feat_mtn_gifting: boolean;
        feat_mtn_datashare: boolean;
        feat_glo_gifting: boolean;
    };
    [key: string]: unknown;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    system_configuration: SystemConfiguration;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
