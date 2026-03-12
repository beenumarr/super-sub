import React from "react";
import { Head, useForm, usePage, router, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { type BreadcrumbItem } from "@/types";

export default function KiraniPage() {
    const {
        auth,
        configs = {},
        balance,
        balance_status,
        balance_message,
        flash,
    } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        kirani_username: configs.kirani_username || "",
        kirani_password: configs.kirani_password || "",
        kirani_api_key: configs.kirani_api_key || "",
        kirani_login_url: configs.kirani_login_url || "",
        kirani_refresh_url: configs.kirani_refresh_url || "",
        kirani_balance_url: configs.kirani_balance_url || "",
        kirani_customer_url: configs.kirani_customer_url || "",
        kirani_minutes_url: configs.kirani_minutes_url || "",
    });

    React.useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (balance_message && balance_status === "failed")
            toast.error(balance_message);
    }, [flash, balance_message, balance_status]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData(e.target.name as keyof typeof data, e.target.value);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("admin.kirani.update"), {
            preserveScroll: true,
            onSuccess: () => toast.success("Kirani configuration updated"),
            onError: (errs) =>
                Object.values(errs)
                    .flat()
                    .forEach((err) => toast.error(String(err))),
        });
    };

    const refreshBalance = () => {
        router.post(
            route("admin.kirani.refresh-balance"),
            {},
            { preserveScroll: true }
        );
    };

    const fields = [
        { name: "kirani_username", label: "Username" },
        { name: "kirani_password", label: "Password" },
        { name: "kirani_api_key", label: "API Key" },
        { name: "kirani_login_url", label: "Login URL" },
        { name: "kirani_refresh_url", label: "Refresh URL" },
        { name: "kirani_balance_url", label: "Balance URL" },
        { name: "kirani_customer_url", label: "Customer URL" },
        { name: "kirani_minutes_url", label: "Minutes URL" },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: route("dashboard") },
        { title: "Admin", href: route("admin.dashboard") },
        { title: "Kirani" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kirani Configuration" />

            <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    {/* Balance Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Credit Balance</CardTitle>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href={route("admin.kirani.plans")}
                                    className="flex items-center gap-2"
                                >
                                    <Button className="gap-2">
                                        <Settings className="h-4 w-4" />
                                        Manage Plans
                                    </Button>
                                </Link>
                                <Button
                                    type="button"
                                    disabled={processing}
                                    onClick={refreshBalance}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh Balance
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-3xl font-bold">
                                    {balance ?? "—"}
                                </p>
                                {balance_message && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {balance_message}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Configuration Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>API Configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {fields.map((field) => (
                                        <div key={field.name} className="flex flex-col space-y-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                {field.label}
                                            </label>
                                            <Input
                                                type="text"
                                                name={field.name}
                                                value={data[field.name as keyof typeof data]}
                                                onChange={handleChange}
                                                placeholder={field.label}
                                            />
                                            {errors[field.name as keyof typeof errors] && (
                                                <span className="text-sm text-red-600 dark:text-red-400">
                                                    {errors[field.name as keyof typeof errors]}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full sm:w-auto"
                                >
                                    {processing ? "Saving..." : "Save Configuration"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
