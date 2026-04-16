import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Activity, Globe, Mail, Settings, CreditCard } from 'lucide-react';
import SitePhotosForm from './Components/SitePhotosForm';
import SiteLogoForm from './Components/SiteLogoForm';
import SiteFaviconForm from './Components/SiteFaviconForm';
import GeneralSettings from './Components/Tabs/GeneralSettings';
import PaymentGateway from './Components/Tabs/PaymentGateway';
import TransactionApi from './Components/Tabs/TransactionApi';
import EmailConfig from './Components/Tabs/EmailConfig';
import AdvancedConfig from './Components/Tabs/AdvancedConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'App Configurations', href: '/admin/app_configurations' },
];

type TabValue =
    | 'general_settings'
    | 'payment_gateway'
    | 'transaction_api'
    | 'email_config'
    | 'advanced_config';

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
    const [currentTab, setCurrentTab] = useState<TabValue>('general_settings');
    const [processing2, setProcessing2] = useState(false);

    const {
        auth,
        monnify_charges_options,
        configs_values,
        site_images,
        theme,
        enable_payvessel,
        enable_Bill_Stack,
        enable_paymentPoint,
    } = usePage().props as unknown as PageProps;

    const { data, setData, put, processing } = useForm(configs_values ?? {});

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData({
            ...data,
            [event.target.name]: event.target.value,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('app_configurations.update', { app_configuration: 1 }), {
            onSuccess: () => {
                toast.success('Configuration Updated Successfully');
                // Reload page to refresh Inertia props with updated config
                setTimeout(() => reloadPage(), 1000);
            },
            onError: (errors) => {
                Object.values(errors)
                    .flat()
                    .map((err) => toast.error(String(err)));
            },
        });
    };

    const reloadPage = () => router.reload();

    const tabTitles: (TabItem | null)[] = [
        { title: 'Website Settings', value: 'general_settings', icon: <Globe className="h-4 w-4" /> },
        { title: 'Payment Gateway', value: 'payment_gateway', icon: <CreditCard className="h-4 w-4" /> },
        {
            title: 'Transaction API',
            value: 'transaction_api',
            icon: <Activity className="h-4 w-4" />,
        },
        { title: 'Email Config', value: 'email_config', icon: <Mail className="h-4 w-4" /> },
        auth?.isMaster
            ? {
                  title: 'Advanced Config',
                  value: 'advanced_config' as TabValue,
                  icon: <Settings className="h-4 w-4" />,
              }
            : null,
    ].filter(Boolean) as TabItem[];

    const tabContent: Record<TabValue, React.ReactNode> = {
        general_settings: (
            <GeneralSettings
                data={data}
                handleOnChange={handleOnChange}
                setData={setData}
                setFormModal={setFormModal}
                setFormModal2={setFormModal2}
                setFaviconModal={setFaviconModal}
                site_images={site_images ?? {}}
                processing2={processing2}
                setProcessing2={setProcessing2}
            />
        ),
        payment_gateway: (
            <PaymentGateway
                data={data}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                setData={setData}
                monnify_charges_options={monnify_charges_options}
                enable_payvessel={enable_payvessel === '1'}
                enable_Bill_Stack={enable_Bill_Stack === '1'}
                enable_paymentPoint={enable_paymentPoint === '1'}
            />
        ),
        transaction_api: (
            <TransactionApi
                data={data}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                setData={setData}
                monnify_charges_options={monnify_charges_options}
                isSuperAdmin={auth?.isSuperAdmin ?? false}
            />
        ),
        email_config: (
            <EmailConfig
                data={data}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />
        ),
        advanced_config: <AdvancedConfig data={data} setData={setData} />,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="App Configurations" />

            <div className="mx-auto flex h-full max-w-6xl flex-col">
                <Card className="mb-4">
                    <CardHeader className="py-4">
                        <CardTitle className="text-lg">App Configurations</CardTitle>
                    </CardHeader>
                </Card>

                <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
                    <nav className="flex shrink-0 flex-col gap-1 border-r p-4 lg:w-48">
                        {tabTitles.map((link) => (
                            <button
                                key={link.value}
                                type="button"
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
                                    currentTab === link.value
                                        ? 'bg-muted text-foreground border border-border'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                                onClick={() => setCurrentTab(link.value)}
                            >
                                {link.icon}
                                {link.title}
                            </button>
                        ))}
                    </nav>

                    <div className="flex-1 overflow-y-auto p-4">
                        <form onSubmit={submit} className="w-full">
                            {/* Ensure logo_type is included in the form data as a safety fallback */}
                            <input type="hidden" name="logo_type" value={(data as any)['logo_type'] ?? ''} />
                            <Card>
                                <CardContent className="pt-6">{tabContent[currentTab]}</CardContent>
                            </Card>
                            <div className="mt-6 flex w-full justify-end">
                                <Button type="submit" disabled={processing}>
                                    Update
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <SitePhotosForm
                reloadPage={reloadPage}
                formModal={formModal}
                setFormModal={setFormModal}
            />
            <SiteLogoForm
                reloadPage={reloadPage}
                formModal={formModal2}
                setFormModal={setFormModal2}
            />
            <SiteFaviconForm
                reloadPage={reloadPage}
                formModal={faviconModal}
                setFormModal={setFaviconModal}
            />
        </AppLayout>
    );
}
