import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';
import { initializeTheme } from './hooks/use-appearance';
import ThemeColorProvider from './components/ThemeColorProvider';

const appName = import.meta.env.VITE_APP_NAME || 'Boltnet';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')).then((module: any) => {
            const page = module.default;
            page.layout =
                page.layout ||
                ((pageNode: ReactNode) => <ThemeColorProvider>{pageNode}</ThemeColorProvider>);
            return page;
        }),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
