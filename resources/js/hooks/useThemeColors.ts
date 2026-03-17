import { usePage } from '@inertiajs/react';

interface ThemeColors {
    primary: string;
    secondary: string;
}

interface SharedProps {
    colors?: ThemeColors;
    auth?: {
        site_primary_color?: string;
        site_secondary_color?: string;
    };
}

function isHexColor(value?: string) {
    return typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

export function useThemeColors(): ThemeColors {
    const { props } = usePage<SharedProps>();

    const fallbackPrimary = '#3b82f6';
    const fallbackSecondary = '#8b5cf6';

    const rawPrimary = props.colors?.primary ?? props.auth?.site_primary_color;
    const rawSecondary = props.colors?.secondary ?? props.auth?.site_secondary_color;

    const colors = {
        primary: isHexColor(rawPrimary) ? rawPrimary : fallbackPrimary,
        secondary: isHexColor(rawSecondary) ? rawSecondary : fallbackSecondary,
    };

    return colors;
}

export function useColorStyles() {
    const colors = useThemeColors();

    return {
        primary: colors.primary || '#3b82f6',
        secondary: colors.secondary || '#8b5cf6',
        primaryHex: colors.primary || '#3b82f6',
        secondaryHex: colors.secondary || '#8b5cf6',
        getCSSVariables: () => ({
            '--color-primary': colors.primary || '#3b82f6',
            '--color-secondary': colors.secondary || '#8b5cf6',
        } as React.CSSProperties),
    };
}
