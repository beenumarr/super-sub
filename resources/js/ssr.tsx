import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import type { ReactNode } from 'react';
import { type RouteName, route } from 'ziggy-js';
import ThemeColorProvider from './components/ThemeColorProvider';

const appName = import.meta.env.VITE_APP_NAME || 'VTU App';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) =>
            resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')).then((module: any) => {
                const page = module.default;
                page.layout =
                    page.layout ||
                    ((pageNode: ReactNode) => <ThemeColorProvider>{pageNode}</ThemeColorProvider>);
                return page;
            }),
        setup: ({ App, props }) => {
            /* eslint-disable */
            // @ts-expect-error
            global.route<RouteName> = (name, params, absolute) =>
                route(name, params as any, absolute, {
                    // @ts-expect-error
                    ...page.props.ziggy,
                    // @ts-expect-error
                    location: new URL(page.props.ziggy.location),
                });
            /* eslint-enable */

            return <App {...props} />;
        },
    }),
);
