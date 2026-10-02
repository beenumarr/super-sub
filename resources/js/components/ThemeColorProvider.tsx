import React, { useEffect } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
    const colors = useThemeColors();

    useEffect(() => {
        const root = document.documentElement;

        const applyColors = () => {
            const configuredPrimary = colors.primary || '#9483ef';
            const configuredSecondary = colors.secondary || '#8b5cf6';

            // Check if dark mode is currently active
            const isDark = root.classList.contains('dark');

            // In dark mode: secondary becomes primary, primary becomes secondary
            // In light mode: primary is primary, secondary is secondary
            const primary = isDark ? configuredSecondary : configuredPrimary;
            const secondary = isDark ? configuredPrimary : configuredSecondary;

            root.style.setProperty('--color-primary', primary);
            root.style.setProperty('--color-secondary', secondary);
            root.style.setProperty('--theme-1', primary);
            root.style.setProperty('--theme-2', secondary);

            // Also apply to body for convenience
            document.body.style.setProperty('--color-primary', primary);
            document.body.style.setProperty('--color-secondary', secondary);
            document.body.style.setProperty('--theme-1', primary);
            document.body.style.setProperty('--theme-2', secondary);

            // Update theme-color meta tag
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', primary);
            }
        };

        applyColors();

        // Listen for changes to class list on document.documentElement (e.g. toggling 'dark')
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    applyColors();
                }
            }
        });

        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, [colors.primary, colors.secondary]);

    return <>{children}</>;
}

export default ThemeColorProvider;
