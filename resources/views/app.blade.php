<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Use uploaded favicon when available, fallback to logo then static icon --}}
        @php
            $siteLogo = config('settings.site_logo');
            $siteFavicon = config('settings.site_favicon');
            $faviconFile = $siteFavicon ?: $siteLogo;
            $favicon = $faviconFile ? asset('storage/uploads/' . $faviconFile) . '?t=' . time() : '/logo-icon.png';
            $faviconExt = $faviconFile ? strtolower(pathinfo($faviconFile, PATHINFO_EXTENSION)) : '';
            $faviconType = match ($faviconExt) {
                'ico' => 'image/x-icon',
                'png' => 'image/png',
                'jpg', 'jpeg' => 'image/jpeg',
                'webp' => 'image/webp',
                'gif' => 'image/gif',
                default => null,
            };
        @endphp

        <link rel="icon" href="{{ $favicon }}" sizes="any">
        @if($faviconType)
            <link rel="icon" href="{{ $favicon }}" type="{{ $faviconType }}">
        @else
            <link rel="icon" href="{{ $favicon }}">
        @endif
        <link rel="apple-touch-icon" href="{{ $favicon }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
