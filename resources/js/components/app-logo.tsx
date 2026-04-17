import { usePage } from '@inertiajs/react';
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
            </div>
        );
    }

    // none mode: show nothing
    return null;
}
