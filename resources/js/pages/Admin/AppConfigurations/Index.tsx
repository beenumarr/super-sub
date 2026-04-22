import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CreditCard, Globe, Mail, Palette, Plug, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import AdvancedConfig from './Components/Tabs/AdvancedConfig';
import AppearanceSettings from './Components/Tabs/AppearanceSettings';
import EmailConfig from './Components/Tabs/EmailConfig';
import GeneralSettings from './Components/Tabs/GeneralSettings';
import PaymentGateway from './Components/Tabs/PaymentGateway';
import TransactionApi from './Components/Tabs/TransactionApi';
import SiteFaviconForm from './Components/SiteFaviconForm';
import SiteLogoForm from './Components/SiteLogoForm';
import SitePhotosForm from './Components/SitePhotosForm';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'App Configurations', href: '/admin/app_configurations' },
];

type TabValue = 'general' | 'appearance' | 'payments' | 'integrations' | 'email' | 'features';

interface TabItem {
    title: string;
    value: TabValue;
    icon: React.ReactNode;
}

interface PageProps {
    auth: { isMaster?: boolean; isSuperAdmin?: boolean };
    monnify_charges_options?: unknown[];
    data?: unknown;
    configs_values: Record<string, unknown>;
    site_images: { bg_0?: string; logo?: string; favicon?: string };
    theme?: string;
    enable_payvessel?: string;
    enable_Bill_Stack?: string;
    enable_paymentPoint?: string;
}

export default function Index() {
    const [formModal, setFormModal] = useState(false);
    const [formModal2, setFormModal2] = useState(false);
    const [faviconModal, setFaviconModal] = useState(false);
    const [currentTab, setCurrentTab] = useState<TabValue>('general');
    const [processing2, setProcessing2] = useState(false);

    const { auth, monnify_charges_options, configs_values, site_images, enable_payvessel, enable_Bill_Stack, enable_paymentPoint } =
        usePage().props as unknown as PageProps;

    const { data, setData, put, processing } = useForm(configs_values as Record<string, string | number | boolean | null> ?? {});

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData({ ...data, [event.target.name]: event.target.value });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('app_configurations.update', { app_configuration: 1 }), {
            onSuccess: () => {
                toast.success('Configuration updated successfully');
                setTimeout(() => router.reload(), 1000);
            },
            onError: (errors) => {
                Object.values(errors)
                    .flat()
                    .forEach((err) => toast.error(String(err)));
            },
        });
    };

    const reloadPage = () => router.reload();

    const tabs: TabItem[] = [
        { title: 'General', value: 'general', icon: <Globe className="h-3.5 w-3.5" /> },
        { title: 'Appearance', value: 'appearance', icon: <Palette className="h-3.5 w-3.5" /> },
        { title: 'Payments', value: 'payments', icon: <CreditCard className="h-3.5 w-3.5" /> },
        { title: 'Integrations', value: 'integrations', icon: <Plug className="h-3.5 w-3.5" /> },
        { title: 'Email', value: 'email', icon: <Mail className="h-3.5 w-3.5" /> },
        ...(auth?.isMaster
            ? [{ title: 'Features', value: 'features' as TabValue, icon: <SlidersHorizontal className="h-3.5 w-3.5" /> }]
            : []),
    ];

    const tabContent: Record<TabValue, React.ReactNode> = {
        general: (
            <GeneralSettings
                data={data as Record<string, unknown>}
                handleOnChange={handleOnChange}
                setData={setData as unknown as (keyOrData: string | Record<string, unknown>, value?: unknown) => void}
            />
        ),
        appearance: (
            <AppearanceSettings
                data={data as Record<string, unknown>}
                setData={setData as unknown as (keyOrData: string | Record<string, unknown>, value?: unknown) => void}
                setFormModal={setFormModal}
                setFormModal2={setFormModal2}
                setFaviconModal={setFaviconModal}
                site_images={site_images ?? {}}
                processing2={processing2}
                setProcessing2={setProcessing2}
            />
        ),
        payments: (
            <PaymentGateway
                data={data as Record<string, unknown>}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                setData={setData as unknown as (keyOrData: string | Record<string, unknown>, value?: unknown) => void}
                monnify_charges_options={monnify_charges_options}
                enable_payvessel={enable_payvessel === '1'}
                enable_Bill_Stack={enable_Bill_Stack === '1'}
                enable_paymentPoint={enable_paymentPoint === '1'}
            />
        ),
        integrations: (
            <TransactionApi
                data={data as Record<string, string | number | undefined>}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                setData={setData as unknown as (key: string, value: string) => void}
                monnify_charges_options={monnify_charges_options}
                isSuperAdmin={auth?.isSuperAdmin ?? false}
            />
        ),
        email: (
            <EmailConfig
                data={data as Record<string, string | number | undefined>}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />
        ),
        features: <AdvancedConfig data={data as Record<string, unknown>} setData={setData as unknown as (data: Record<string, unknown>) => void} />,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="App Configurations" />

            <div className="mx-auto w-full max-w-5xl px-4 py-6">

                {/* Page heading */}
                <div className="mb-6">
                    <h1 className="text-foreground text-xl font-semibold">App Configurations</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage your application settings and integrations.</p>
                </div>

                <form onSubmit={submit}>
                    {/* Top tab bar */}
                    <div className="border-border mb-0 w-full border-b">
                        <nav className="-mb-px flex w-full gap-0 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setCurrentTab(tab.value)}
                                    className={cn(
                                        'flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                                        currentTab === tab.value
                                            ? 'border-foreground text-foreground'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                                    )}
                                >
                                    {tab.icon}
                                    {tab.title}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab content */}
                    <div className="border-border bg-card w-full rounded-b-lg border border-t-0 px-6 py-6">
                        {tabContent[currentTab]}
                    </div>

                    {/* Save bar */}
                    <div className="border-border mt-4 flex items-center justify-end border-t pt-4">
                        <Button type="submit" disabled={processing} size="sm">
                            {processing ? 'Saving…' : 'Save changes'}
                        </Button>
                    </div>
                </form>
            </div>

            <SitePhotosForm reloadPage={reloadPage} formModal={formModal} setFormModal={setFormModal} />
            <SiteLogoForm reloadPage={reloadPage} formModal={formModal2} setFormModal={setFormModal2} />
            <SiteFaviconForm reloadPage={reloadPage} formModal={faviconModal} setFormModal={setFaviconModal} />
        </AppLayout>
    );
}
