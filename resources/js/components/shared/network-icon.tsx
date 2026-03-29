import { cn } from '@/lib/utils';

export const NetworkIcon = ({ network }: { network: string }) => {
    // Map of network names to their brand colors and icons
    const networkConfig: Record<string, { color: string; logo: string }> = {
        MTN: {
            color: 'bg-yellow-400 dark:bg-yellow-500',
            logo: '/images/icons/mtn.png', // Path to your logo
        },
        AIRTEL: {
            color: '',
            logo: '/images/icons/airtel.png',
        },
        GLO: {
            color: 'bg-green-500 dark:bg-green-600',
            logo: '/images/icons/glo.png',
        },
        T2MOBILE: {
            color: 'bg-green-400 dark:bg-green-500',
            logo: '/images/icons/t2mobile.jpg',
        },
        MOMO: {
            color: 'bg-green-400 dark:bg-green-500',
            logo: '/images/icons/momo-log.svg',
        },
        SMARTCASH: {
            color: 'bg-green-400 dark:bg-green-500',
            logo: '/images/icons/smartcash.png',
        },
    };

    const config = networkConfig[network] || {
        color: 'bg-gray-200 dark:bg-gray-700',
        logo: '',
    };

    // If we have a logo, show it, otherwise show the first letter in a colored circle
    if (config.logo) {
        try {
            return (
                <div className={cn('flex items-center justify-center rounded-full shadow-sm', '')}>
                    <img
                        src={config.logo}
                        alt={network}
                        className="h-10 w-10 rounded-full"
                        onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const nextElement = target.nextElementSibling as HTMLElement;
                            if (nextElement) nextElement.style.display = 'block';
                        }}
                    />
                    {/* <span className="hidden font-bold text-white">{network.charAt(0)}</span> */}
                </div>
            );
        } catch (error) {
            console.error('Error rendering network logo:', error);
        }
    }

    // Fallback to just showing the first letter
    return (
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', config.color)}>
            <span className="font-bold text-white">{network.charAt(0)}</span>
        </div>
    );
};
