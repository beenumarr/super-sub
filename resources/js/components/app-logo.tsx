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
                <AppLogoIcon className="h-9 w-auto max-w-[160px]" alt={siteName} />
            </div>
        );
    }

    // none mode: show nothing
    if (logoType === 'none') {
        return null;
    }

    // titled mode or default: show logo icon alongside site name
    return (
        <div className="flex items-center gap-2.5">
            <AppLogoIcon className="h-9 w-9" alt={siteName} />
            <span className="truncate text-base font-bold tracking-tight text-foreground">{siteName}</span>
        </div>
    );
}

