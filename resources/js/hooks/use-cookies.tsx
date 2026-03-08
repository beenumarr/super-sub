import { useCallback, useEffect, useState } from 'react';

export type CookieConsent = 'accepted' | 'rejected' | null;

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') {
        return null;
    }
    const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
    const cookie = cookies.find((c) => c.startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
};

export function useCookieConsent() {
    const [consent, setConsent] = useState<CookieConsent>(null);

    useEffect(() => {
        const savedConsent = getCookie('cookieConsent') as CookieConsent;
        setConsent(savedConsent || null);
    }, []);

    const updateConsent = useCallback((newConsent: 'accepted' | 'rejected') => {
        setConsent(newConsent);
        setCookie('cookieConsent', newConsent);
        // Optionally, notify analytics services (e.g., enable/disable tracking)
        if (newConsent === 'accepted') {
            // Initialize analytics (e.g., Google Analytics)
            console.log('Analytics enabled');
        } else {
            // Disable analytics
            console.log('Analytics disabled');
        }
    }, []);

    return {
        consent,
        accept: () => updateConsent('accepted'),
        reject: () => updateConsent('rejected'),
    } as const;
}
