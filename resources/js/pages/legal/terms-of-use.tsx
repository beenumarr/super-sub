import { branding } from '@/config/branding';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function TermsOfUse() {
    return (
        <AppLayout>
            <Head title="Terms of Use" />
            <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-3xl font-bold">Terms of Use</h1>
                <p className="mb-4 text-gray-600">By using our services, you agree to the following terms:</p>
                <ul className="list-disc space-y-2 pl-6 text-gray-600">
                    <li>Use services lawfully and responsibly.</li>
                    <li>No abuse, fraud, or violations of third-party rights.</li>
                    <li>We may suspend or terminate accounts that violate policies.</li>
                </ul>
                <h2 className="mt-8 text-xl font-semibold">Contact</h2>
                <p className="text-gray-600">Questions? Email {branding.supportEmail}.</p>
            </div>
        </AppLayout>
    );
}
