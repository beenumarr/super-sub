import { branding } from '@/config/branding';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function PrivacyPolicy() {
    return (
        <AppLayout>
            <Head title="Privacy Policy" />
            <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
                <p className="mb-4 text-gray-600">
                    We value your privacy. This policy explains how we collect, use, and protect your information when you use our services.
                </p>
                <h2 className="mt-8 text-xl font-semibold">Information We Collect</h2>
                <p className="text-gray-600">Account details, usage data, device information, and logs necessary to provide services.</p>
                <h2 className="mt-8 text-xl font-semibold">How We Use Information</h2>
                <p className="text-gray-600">To deliver services, prevent fraud, improve reliability, and comply with legal obligations.</p>
                <h2 className="mt-8 text-xl font-semibold">Contact</h2>
                <p className="text-gray-600">Questions? Email {branding.supportEmail}.</p>
            </div>
        </AppLayout>
    );
}
