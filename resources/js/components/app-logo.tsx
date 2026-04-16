<<<<<<< HEAD
import { branding } from '@/config/branding';
=======
import { usePage } from '@inertiajs/react';
>>>>>>> af529122c89458f6ab673bbd279ba6f013276113
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { config } = usePage().props as any;
    const siteName = config?.site_name || 'VTU App';
    const logoType = config?.logo_type;

    // icon mode: only show logo icon, no text
    if (logoType === 'icon') {
        return (
            <div className="flex items-center justify-center">
                <AppLogoIcon className="h-10 w-10" alt={siteName} />
            </div>
<<<<<<< HEAD
            <div className="ml-1 grid flex-1 text-left text-lg">
                <span className="mb-0.5 truncate leading-none font-semibold">{branding.appName}</span>
=======
        );
    }

    // titled mode: show logo icon with site name under it
    if (logoType === 'titled' || !logoType) {
        return (
            <div className="flex flex-col items-center">
                <AppLogoIcon className="h-10 w-10" alt={siteName} />
                <div className="mt-1 text-center">
                    <span className="block truncate text-sm font-semibold">{siteName}</span>
                </div>
>>>>>>> af529122c89458f6ab673bbd279ba6f013276113
            </div>
        );
    }

    // none mode: show nothing
    return null;
}
