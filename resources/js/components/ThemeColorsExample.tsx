/**
 * Theme Colors Usage Guide
 * 
 * The theme system allows admins to set primary and secondary colors
 * that apply throughout the entire site.
 * 
 * METHODS TO USE THEME COLORS:
 * 
 * 1. Using the useThemeColors hook (TypeScript):
 * ----
 * import { useThemeColors } from '@/hooks/useThemeColors';
 * 
 * export function MyComponent() {
 *     const colors = useThemeColors();
 *     
 *     return <div style={{ color: colors.primary }}>Text</div>;
 * }
 * 
 * 2. Using CSS Variables (CSS/Tailwind):
 * ----
 * .my-element {
 *     background-color: var(--color-primary);
 *     border-color: var(--color-secondary);
 * }
 * 
 * 3. Using helper classes:
 * ----
 * <div className="bg-primary text-white">Primary Background</div>
 * <div className="bg-secondary">Secondary Background</div>
 * <div className="text-primary">Primary Text</div>
 * <div className="border-2 border-primary">Primary Border</div>
 * 
 * 4. Using inline styles:
 * ----
 * <div style={{ backgroundColor: 'var(--color-primary)' }}>
 *     Dynamic colored element
 * </div>
 * 
 * AVAILABLE COLORS:
 * - --color-primary   (admin's primary color choice)
 * - --color-secondary (admin's secondary color choice)
 * 
 * DEFAULT VALUES:
 * - Primary: #3b82f6 (Blue)
 * - Secondary: #8b5cf6 (Purple)
 * 
 * WHEN COLORS UPDATE:
 * - Admin changes colors in App Configurations > Website Settings
 * - Colors are saved to database
 * - CSS variables are injected via ThemeColorProvider
 * - All components using var(--color-*) update automatically
 * - No page reload needed
 */

/**
 * EXAMPLE COMPONENT:
 */

import React from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

export function ThemeColorsExample() {
    const colors = useThemeColors();

    return (
        <div className="space-y-4 p-4">
            {/* Using CSS Variables */}
            <div
                style={{
                    backgroundColor: 'var(--color-primary)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    color: 'white',
                }}
            >
                Using CSS Variable: var(--color-primary)
            </div>

            {/* Using helper classes */}
            <div className="bg-primary text-white p-4 rounded">
                Using helper class: bg-primary
            </div>

            {/* Using useThemeColors hook */}
            <div
                style={{
                    backgroundColor: colors.primary,
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    color: 'white',
                }}
            >
                Using useThemeColors hook
            </div>

            {/* Secondary color examples */}
            <div className="border-4 border-secondary p-4 rounded">
                Secondary color border
            </div>

            <button
                style={{
                    backgroundColor: colors.secondary,
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                }}
            >
                Secondary Color Button
            </button>
        </div>
    );
}
