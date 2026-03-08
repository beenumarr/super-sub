import { Button } from '@/components/ui/button'; // Adjust import based on your setup
import { useCookieConsent } from '@/hooks/use-cookies';
import { Link } from '@inertiajs/react';

export function CookieConsentBanner() {
    const { consent, accept, reject } = useCookieConsent();

    // Only show the banner if consent is undecided (null)
    if (consent !== null) {
        return null;
    }

    return (
        <div className="text-theme-1 fixed right-0 bottom-0 left-0 z-50 bg-zinc-800 p-4">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm">
                    We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                </p>
                <div className="flex gap-2">
                    <Link href="/register">
                        <Button size="sm" variant="outline" className="border-theme-1 text-theme-1 hover:bg-theme-1/10">
                            Learn More
                        </Button>
                    </Link>
                    <Button size="sm" className="bg-theme-1 text-white hover:bg-gray-100" onClick={accept}>
                        Accept
                    </Button>
                    <Button size="sm" variant="outline" className="text-theme-1 hover:bg-theme-1/10 border-black" onClick={reject}>
                        Reject
                    </Button>
                </div>
            </div>
        </div>
    );
}
