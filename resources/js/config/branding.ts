export interface BrandingConfig {
    appName: string;
    supportEmail: string;
    apiBaseUrl: string;
    appDomain: string;
    logos: {
        app: string;
    };
}

const fallbackAppName = import.meta.env.VITE_APP_NAME || 'VTU App';

export const branding: BrandingConfig = {
    appName: fallbackAppName,
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@vtuapp.com.ng',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.vtuapp.com.ng',
    appDomain: import.meta.env.VITE_APP_DOMAIN || 'vtuapp.com.ng',
    logos: {
        app: import.meta.env.VITE_APP_LOGO || '/logo_mob.png',
    },
};

