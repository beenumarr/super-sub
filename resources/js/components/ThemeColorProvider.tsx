import React, { useEffect } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
    const colors = useThemeColors();

    useEffect(() => {
        // Apply colors as CSS variables
        const root = document.documentElement;
        const primary = colors.primary || '#3b82f6';
        const secondary = colors.secondary || '#8b5cf6';

        root.style.setProperty('--color-primary', primary);
        root.style.setProperty('--color-secondary', secondary);
        // Tailwind theme tokens used across admin & user UI
        root.style.setProperty('--theme-1', primary);
        root.style.setProperty('--theme-2', secondary);

        // Also apply to body for convenience
        document.body.style.setProperty('--color-primary', primary);
        document.body.style.setProperty('--color-secondary', secondary);
        document.body.style.setProperty('--theme-1', primary);
        document.body.style.setProperty('--theme-2', secondary);

        // Optional: Update theme-color meta tag
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', primary);
        }
    }, [colors.primary, colors.secondary]);

    return <>{children}</>;
}

export default ThemeColorProvider;
