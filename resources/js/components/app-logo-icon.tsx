import { usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    className?: string;
    alt?: string;
}

export default function AppLogoIcon({ className = 'h-10 w-10', alt }: Props) {
    const { config } = usePage().props as unknown as { config?: { site_logo?: string; site_name?: string } };
    const siteLogo = config?.site_logo;
    const siteName = config?.site_name || 'VTU App';

    const [errorStage, setErrorStage] = useState<number>(0);

    // Compute primary logo URL
    let primaryUrl = '/logo-icon.png';
    if (siteLogo && siteLogo.trim() !== '') {
        if (siteLogo.startsWith('http://') || siteLogo.startsWith('https://') || siteLogo.startsWith('/')) {
            primaryUrl = siteLogo;
        } else {
            primaryUrl = `/storage/uploads/${siteLogo}?t=${Date.now()}`;
        }
    }

    // Determine target URL based on error stage
    let currentSrc = primaryUrl;
    if (errorStage === 1) {
        currentSrc = '/logo-icon.png';
    } else if (errorStage === 2) {
        currentSrc = '/logo_mob.png';
    }

    const containerClass = `${className} shrink-0 overflow-hidden rounded-md flex items-center justify-center`;

    if (errorStage < 3) {
        return (
            <div className={containerClass}>
                <img
                    src={currentSrc}
                    alt={alt ?? siteName}
                    className="h-full w-full object-contain"
                    onError={() => {
                        setErrorStage((prev) => prev + 1);
                    }}
                />
            </div>
        );
    }

    // Final fallback: Text Emblem badge with first letter of site name
    return (
        <div className={`${containerClass} bg-primary text-primary-foreground font-bold text-sm select-none`}>
            {siteName.charAt(0).toUpperCase()}
        </div>
    );
}

