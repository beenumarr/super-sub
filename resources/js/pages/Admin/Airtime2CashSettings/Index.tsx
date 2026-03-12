import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm, router } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { type BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/admin/dashboard" },
    { title: "A2C Settings", href: "/admin/airtime-to-cash-settings" },
];

export default function Index(props: any) {
    const { configs, networks, phoneNumbers } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Airtime to Cash Settings" />

            <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-8">
                <div className="mb-6 space-y-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Airtime to Cash Settings</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Configure the Airtime to Cash feature
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    <GeneralSettings configs={configs} />
                    <NetworkSettings networks={networks} />
                    <PhoneNumberSettings phoneNumbers={phoneNumbers} />
                </div>
            </div>
        </AppLayout>
    );
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
    );
}

function GeneralSettings({ configs }: { configs: any }) {
    const { data, setData, post, processing, errors } = useForm({
        a2c_enabled: configs?.a2c_enabled,
        a2c_auto_method_enabled: configs?.a2c_auto_method_enabled,
        a2c_manual_method_enabled: configs?.a2c_manual_method_enabled,
        a2c_min_amount: configs?.a2c_min_amount || 50,
        a2c_max_amount: configs?.a2c_max_amount || 5000,
        a2c_daily_limit: configs?.a2c_daily_limit || 50000,
        a2c_conversion_rate: configs?.a2c_conversion_rate || 70,
        a2c_withdrawal_fee: configs?.a2c_withdrawal_fee || 50,
        a2c_auto_approval: configs?.a2c_auto_approval || false,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route("admin.config.update"), {
            onSuccess: () => {
                toast.success("General settings updated successfully");
                // Reload page to fetch fresh data
                router.reload();
            },
            onError: (errors: Record<string, string>) => {
                Object.keys(errors).forEach((key) => {
                    toast.error(errors[key]);
                });
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <SectionHeader
                        title="General Configuration"
                        description="Configure the basic settings for the Airtime to Cash feature"
                    />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Service</label>
                            <Switch
                                checked={Boolean(data.a2c_enabled)}
                                onCheckedChange={(checked) => setData({ ...data, a2c_enabled: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Method</label>
                            <Switch
                                checked={Boolean(data.a2c_auto_method_enabled)}
                                onCheckedChange={(checked) => setData({ ...data, a2c_auto_method_enabled: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Manual Method</label>
                            <Switch
                                checked={Boolean(data.a2c_manual_method_enabled)}
                                onCheckedChange={(checked) => setData({ ...data, a2c_manual_method_enabled: checked })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="a2c_min_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Minimum Amount (₦)
                            </label>
                            <Input
                                id="a2c_min_amount"
                                type="number"
                                value={data.a2c_min_amount}
                                onChange={(e) => setData("a2c_min_amount", e.target.value)}
                            />
                            {errors.a2c_min_amount && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.a2c_min_amount}</p>}
                        </div>

                        <div>
                            <label htmlFor="a2c_max_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Maximum Amount (₦)
                            </label>
                            <Input
                                id="a2c_max_amount"
                                type="number"
                                value={data.a2c_max_amount}
                                onChange={(e) => setData("a2c_max_amount", e.target.value)}
                            />
                            {errors.a2c_max_amount && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.a2c_max_amount}</p>}
                        </div>

                        <div>
                            <label htmlFor="a2c_daily_limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Daily Limit (₦)
                            </label>
                            <Input
                                id="a2c_daily_limit"
                                type="number"
                                value={data.a2c_daily_limit}
                                onChange={(e) => setData("a2c_daily_limit", e.target.value)}
                            />
                            {errors.a2c_daily_limit && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.a2c_daily_limit}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="a2c_conversion_rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Conversion Rate (%)
                            </label>
                            <Input
                                id="a2c_conversion_rate"
                                type="number"
                                value={data.a2c_conversion_rate}
                                onChange={(e) => setData("a2c_conversion_rate", e.target.value)}
                                placeholder="e.g., 70%"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Percentage of airtime value credited to user</p>
                            {errors.a2c_conversion_rate && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.a2c_conversion_rate}</p>}
                        </div>

                        <div>
                            <label htmlFor="a2c_withdrawal_fee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Withdrawal Fee (₦)
                            </label>
                            <Input
                                id="a2c_withdrawal_fee"
                                type="number"
                                value={data.a2c_withdrawal_fee}
                                onChange={(e) => setData("a2c_withdrawal_fee", e.target.value)}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fee charged when users withdraw from A2C balance</p>
                            {errors.a2c_withdrawal_fee && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.a2c_withdrawal_fee}</p>}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : "Save General Settings"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function NetworkSettings({ networks }: { networks: any[] }) {
    const { data, setData, put, processing, errors } = useForm({
        services: networks || [],
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(route("airtime_to_cash_services.update"), {
            onSuccess: () => {
                toast.success("Network settings updated successfully");
                // Reload page to fetch fresh data
                router.reload();
            },
            onError: (errors: Record<string, string>) => {
                Object.keys(errors).forEach((key) => {
                    toast.error(errors[key]);
                });
            },
        });
    };

    const getValue = (name: string, key: string) => {
        const service = data.services.find((service: any) => service.name === name);
        return service?.[key];
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <SectionHeader
                        title="Network Configuration"
                        description="Manage which networks can be used for Airtime to Cash and their settings"
                    />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="overflow-x-auto border dark:border-gray-800 rounded-lg">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/40 border-b dark:border-gray-800">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Network</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Automated</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Manual</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Conversion Rate</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">API</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {data.services.map((network: any) => (
                                    <tr key={network.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{network.name}</td>
                                        <td className="px-4 py-3">
                                            <Switch
                                                checked={Boolean(getValue(network.name, "a2c_auto_method_enabled"))}
                                                onCheckedChange={(checked) => {
                                                    const updated = data.services.map((s: any) =>
                                                        s.name === network.name ? { ...s, a2c_auto_method_enabled: checked ? 1 : 0 } : s
                                                    );
                                                    setData({ services: updated });
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Switch
                                                checked={Boolean(getValue(network.name, "a2c_manual_method_enabled"))}
                                                onCheckedChange={(checked) => {
                                                    const updated = data.services.map((s: any) =>
                                                        s.name === network.name ? { ...s, a2c_manual_method_enabled: checked ? 1 : 0 } : s
                                                    );
                                                    setData({ services: updated });
                                                }}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Input
                                                name={network.name}
                                                type="text"
                                                value={getValue(network.name, "a2c_conversion_rate")}
                                                onChange={(e) => {
                                                    const updated = data.services.map((s: any) =>
                                                        s.name === network.name ? { ...s, a2c_conversion_rate: e.target.value } : s
                                                    );
                                                    setData({ services: updated });
                                                }}
                                                className="w-20"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                name={network.name}
                                                value={getValue(network.name, "airtime_to_cash_api_id")}
                                                onChange={(e) => {
                                                    const updated = data.services.map((s: any) =>
                                                        s.name === network.name ? { ...s, airtime_to_cash_api_id: e.target.value } : s
                                                    );
                                                    setData({ services: updated });
                                                }}
                                                className="px-2 py-1 border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md text-sm"
                                            >
                                                <option value="">Select API</option>
                                                <option value="1">AutoPilot</option>
                                                <option value="2">VTPass</option>
                                                <option value="3">SmartRecharge</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : "Update Network Settings"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function PhoneNumberSettings({ phoneNumbers }: { phoneNumbers: any }) {
    const { data, setData, post, processing, errors } = useForm({
        a2c_mtn_phone_number: phoneNumbers?.a2c_mtn_phone_number || "",
        a2c_glo_phone_number: phoneNumbers?.a2c_glo_phone_number || "",
        a2c_airtel_phone_number: phoneNumbers?.a2c_airtel_phone_number || "",
        a2c_ninemoble_phone_number: phoneNumbers?.a2c_ninemoble_phone_number || "",
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route("admin.config.update"), {
            onSuccess: () => {
                toast.success("Receiver phone numbers updated successfully");
                // Reload page to fetch fresh data
                router.reload();
            },
            onError: (errors: Record<string, string>) => {
                Object.keys(errors).forEach((key) => {
                    toast.error(errors[key]);
                });
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <SectionHeader
                        title="Receiver Phone Numbers"
                        description="Set the phone numbers that will receive airtime from users for each network during manual transfers"
                    />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="a2c_mtn_phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                MTN
                            </label>
                            <Input
                                id="a2c_mtn_phone_number"
                                type="text"
                                value={data.a2c_mtn_phone_number}
                                onChange={(e) => setData("a2c_mtn_phone_number", e.target.value)}
                                placeholder="08012345678"
                            />
                            {errors.a2c_mtn_phone_number && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.a2c_mtn_phone_number}</p>}
                        </div>

                        <div>
                            <label htmlFor="a2c_glo_phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                GLO
                            </label>
                            <Input
                                id="a2c_glo_phone_number"
                                type="text"
                                value={data.a2c_glo_phone_number}
                                onChange={(e) => setData("a2c_glo_phone_number", e.target.value)}
                                placeholder="08112345678"
                            />
                            {errors.a2c_glo_phone_number && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.a2c_glo_phone_number}</p>}
                        </div>

                        <div>
                            <label htmlFor="a2c_airtel_phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                AIRTEL
                            </label>
                            <Input
                                id="a2c_airtel_phone_number"
                                type="text"
                                value={data.a2c_airtel_phone_number}
                                onChange={(e) => setData("a2c_airtel_phone_number", e.target.value)}
                                placeholder="08012345678"
                            />
                            {errors.a2c_airtel_phone_number && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.a2c_airtel_phone_number}</p>}
                        </div>

                        <div>
                            <label htmlFor="a2c_ninemoble_phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                9MOBILE
                            </label>
                            <Input
                                id="a2c_ninemoble_phone_number"
                                type="text"
                                value={data.a2c_ninemoble_phone_number}
                                onChange={(e) => setData("a2c_ninemoble_phone_number", e.target.value)}
                                placeholder="09012345678"
                            />
                            {errors.a2c_ninemoble_phone_number && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.a2c_ninemoble_phone_number}</p>}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : "Update Phone Numbers"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
