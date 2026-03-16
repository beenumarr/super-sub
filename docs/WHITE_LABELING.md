## White‑labeling and Rebranding Guide

This app is designed as a multi‑tenant / SaaS platform that can be deployed for multiple clients. This guide explains how to rename and rebrand it safely without hunting for strings across the codebase.

The goal is:

- One place to change **names, logo paths, support email and API base URL**
- Minimal, theme‑aware UI changes (no hard‑coded bright colours)

---

## 1. Core naming – Laravel & Vite

### `.env`

Set the base name once and let both backend and frontend inherit it:

```env
APP_NAME=Acme VTU

VITE_APP_NAME="${APP_NAME}"
VITE_APP_DOMAIN="acmevtu.com"
VITE_SUPPORT_EMAIL="support@acmevtu.com"
VITE_API_BASE_URL="https://api.acmevtu.com"
VITE_APP_LOGO="/logo_acme.png"
```

Key notes:

- `APP_NAME` feeds Laravel config (`config/app.php`), cache/session prefixes, etc.
- `VITE_APP_NAME` is used by the React SPA for document titles.
- `VITE_APP_DOMAIN`, `VITE_SUPPORT_EMAIL`, `VITE_API_BASE_URL`, `VITE_APP_LOGO` are used by the frontend branding config (see below).

After changing `.env`, run:

```bash
php artisan config:clear
php artisan cache:clear
```

and rebuild your assets (`npm run build` or `npm run dev`).

---

## 2. Frontend branding configuration

All reusable branding values live in `resources/js/config/branding.ts`:

```ts
export interface BrandingConfig {
    appName: string;
    supportEmail: string;
    apiBaseUrl: string;
    appDomain: string;
    logos: {
        app: string;
    };
}

const fallbackAppName = import.meta.env.VITE_APP_NAME || 'VTU App';

export const branding: BrandingConfig = {
    appName: fallbackAppName,
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@vtuapp.com.ng',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.vtuapp.com.ng',
    appDomain: import.meta.env.VITE_APP_DOMAIN || 'vtuapp.com.ng',
    logos: {
        app: import.meta.env.VITE_APP_LOGO || '/logo_mob.png',
    },
};
```

To rebrand for a new client you usually **only touch `.env`**, not this file.

Places already wired to `branding`:

- `app-logo-icon.tsx` / `app-logo.tsx` – app logo and name in navigation and auth layouts
- `ApiDocumentation.tsx` – API base URL and endpoints (`branding.apiBaseUrl`)
- `RegistrationClosed.tsx`, `terms-of-use.tsx`, `privacy-policy.tsx` – support email (`branding.supportEmail`)

If you add new marketing or settings pages, prefer:

```ts
import { branding } from '@/config/branding';

branding.appName;
branding.supportEmail;
branding.apiBaseUrl;
branding.logos.app;
```

instead of hard‑coding names or URLs.

---

## 3. Logos and icons

### Primary app logo

- Default path is `public/logo_mob.png`.
- Frontend uses `branding.logos.app`, which defaults to `/logo_mob.png`.

To change the logo for a client:

1. Add a new file under `public/`, e.g. `public/logo_client.png`.
2. Set in `.env`:

   ```env
   VITE_APP_LOGO="/logo_client.png"
   ```

3. Rebuild assets and clear caches.

### Network & bank icons

These are *brand* assets, not per‑client branding:

- `resources/js/components/shared/network-icon.tsx`
- `resources/js/components/shared/bank-icon.tsx`

You normally do **not** change these per client; only update if you want different network/bank art globally.

---

## 4. Theme and colours

The project already centralizes theme and appearance:

- Global Tailwind palette and CSS variables (Shadcn UI)
- Per‑tenant configuration under **Admin → App Configurations** (logo, theme colours, etc.)

For a new client:

1. Deploy the app with a fresh database.
2. Log in as an admin user.
3. Go to **Admin → App Configurations** and update:
   - Primary colour / accent if exposed
   - Logos and favicons via the provided forms
3. Optionally customize landing copy and images as needed.

If you must hard‑tune colour tokens, do it centrally in the Tailwind/theme config instead of individual components.

---

## 5. What to change for a new client – checklist

### Backend / environment

- [ ] Set `APP_NAME` in `.env`
- [ ] Set `APP_URL`, database, mail and other envs as usual

### Frontend branding

- [ ] Set `VITE_APP_NAME`, `VITE_APP_DOMAIN`
- [ ] Set `VITE_SUPPORT_EMAIL`
- [ ] Set `VITE_API_BASE_URL`
- [ ] Set `VITE_APP_LOGO` to your logo path
- [ ] Rebuild assets (`npm run build` or `npm run dev`)

### Admin configuration

- [ ] Log in as admin
- [ ] Update logos and app colours in **App Configurations**
- [ ] Review marketing copy on the landing page and legal pages

At this point, the app name, logo, support email, and API URLs should all reflect the new client without touching individual components.

---

## 6. Extending the branding system

If you later need additional tenant‑specific values (e.g. WhatsApp number, social links):

1. Add fields to `BrandingConfig` and `branding` in `resources/js/config/branding.ts`.
2. Add corresponding `VITE_...` variables in `.env` (with safe defaults).
3. Replace hard‑coded usages in components with `branding.<field>`.

Keep all such additions in **one place** (`branding.ts`) so future rebrands remain quick and predictable.

