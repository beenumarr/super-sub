<<<<<<< HEAD
import { branding } from '@/config/branding';

export default function AppLogoIcon() {
    return <img src={branding.logos.app} alt={branding.appName} className="h-10" />;
=======
import { usePage } from '@inertiajs/react';
import { Image as ImageIcon } from 'lucide-react';

interface Props {
    className?: string;
    alt?: string;
}

export default function AppLogoIcon({ className = 'h-10 w-10', alt }: Props) {
    const { config } = usePage().props as any;
    const siteLogo = config?.site_logo;

    // Construct full URL for uploaded logo with cache busting
    const logoUrl = siteLogo ? `/storage/uploads/${siteLogo}?t=${Date.now()}` : null;

    // Container ensures a fixed box; image fills it while preserving aspect ratio
    const containerClass = `${className} overflow-hidden rounded-md flex items-center justify-center`;

    if (logoUrl) {
        return (
            <div className={containerClass}>
                <img
                    src={logoUrl}
                    alt={alt ?? 'logo'}
                    className="h-auto max-h-full w-auto max-w-full object-contain"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>
        );
    }

    // Placeholder icon when no logo is configured
    return (
        <div className={containerClass}>
            <ImageIcon className="w-3/4 h-3/4 text-sidebar-primary-foreground/70" />
        </div>
    );
>>>>>>> af529122c89458f6ab673bbd279ba6f013276113
}
