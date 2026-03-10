import { cn } from '@/lib/utils';

export const BankIcon = ({ bank }: { bank: string }) => {
    // Map of network names to their brand colors and icons
    const bankConfig: Record<string, { color: string; logo: string }> = {
        WEMA: {
            color: 'bg-yellow-400 dark:bg-yellow-500',
            logo: '/images/icons/banks/wema_bank.svg', // Path to your logo
        },
        STERLING: {
            color: 'bg-green-400 dark:bg-green-500',
            logo: '/images/icons/banks/sterling_bank.svg',
        },
        MONIEPOINT: {
            color: 'bg-green-400 dark:bg-green-500',
            logo: '/images/icons/banks/moniepoint.svg',
        },
        NINEPSB: {
            color: 'bg-green-400 dark:bg-green-500',
            logo: '/images/icons/banks/9psb.png',
        },
        PALMPAY: {
            color: 'bg-green-400 dark:bg-green-500',
            logo: '/images/icons/banks/palmpay.png',
        },
    };

    const config = bankConfig[bank] || {
        color: 'bg-gray-200 dark:bg-gray-700',
        logo: '',
    };

    // If we have a logo, show it, otherwise show the first letter in a colored circle
    if (config.logo) {
        try {
            return (
                <div className={cn('flex items-center justify-center rounded-full', config.color)}>
                    <img
                        src={config.logo}
                        alt={bank}
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
            <span className="font-bold text-white">{bank.charAt(0)}</span>
        </div>
    );
};
