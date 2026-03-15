/**
 * Theme utilities for dynamic Tailwind class mapping.
 * Use with theme keys (e.g. "slate-100", "theme-2") to get corresponding CSS classes.
 */

import {
    BgColorTheme,
    BorderColorTheme,
    HoverBgColorTheme,
    HoverBorderColorTheme,
    HoverTextColorTheme,
    TextColorTheme,
} from './Themes/theme-colors';

export { BgColorTheme, BorderColorTheme, HoverBgColorTheme, HoverBorderColorTheme, HoverTextColorTheme, TextColorTheme };

export const BgColor = BgColorTheme;
export const HoverBgColor = HoverBgColorTheme;
export const TextColor = TextColorTheme;
export const HoverTextColor = HoverTextColorTheme;
export const BorderColor = BorderColorTheme;
export const HoverBorderColor = HoverBorderColorTheme;
