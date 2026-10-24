import React, { useState, useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Key, Smartphone, CheckCircle2, AlertCircle, Send, UploadCloud, Info } from "lucide-react";
import toast from "react-hot-toast";
import { type BreadcrumbItem } from "@/types";

interface SettingsProps {
    settings: {
        enabled: boolean;
        project_id: string;
        client_email: string;
        has_private_key: boolean;
        has_credentials: boolean;
        registered_tokens_count: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/admin/dashboard" },
    { title: "Push Notifications", href: "/admin/notifications/broadcast" },
    { title: "Firebase Settings", href: "/admin/notifications/settings" },
];

export default function Settings({ settings }: SettingsProps) {
    const { flash } = usePage().props as any;

    const { data, setData, post, processing, errors } = useForm({
        enabled: settings.enabled,
        service_account_json: "",
        service_account_file: null as File | null,
    });

    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.warning) toast.warning(flash.warning);
    }, [flash]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        post("/admin/notifications/settings", {
            onSuccess: () => {
                toast.success("Settings saved successfully");
                setData("service_account_json", "");
                setData("service_account_file", null);
            },
            onError: (errs) => {
                Object.values(errs).flat().forEach((err: any) => toast.error(String(err)));
            },
        });
    };

    const handleTestNotification = () => {
        setIsTesting(true);
        post("/admin/notifications/test", {
            onFinish: () => setIsTesting(false),
            onError: (errs) => {
                Object.values(errs).flat().forEach((err: any) => toast.error(String(err)));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Firebase Notification Settings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8 max-w-5xl">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Firebase Push Notification Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Configure Firebase Cloud Messaging (FCM HTTP v1) credentials for mobile push notifications
                    </p>
                </div>

                {/* Status Overview Card */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Service Status</CardTitle>
                            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">
                                    {settings.enabled && settings.has_credentials ? "Active" : "Inactive"}
                                </span>
                                {settings.enabled && settings.has_credentials ? (
                                    <Badge className="bg-emerald-500 text-white">Online & Ready</Badge>
                                ) : (
                                    <Badge variant="destructive">Not Configured</Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {settings.project_id ? `Project ID: ${settings.project_id}` : "No Firebase project linked yet"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Registered Mobile Devices</CardTitle>
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{settings.registered_tokens_count.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Mobile app devices ready to receive background push alerts
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Settings Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Key className="h-5 w-5 text-primary" />
                            Firebase Service Account Credentials
                        </CardTitle>
                        <CardDescription>
                            Connect your Google Firebase Service Account private key to dispatch notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Toggle Enable/Disable */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">Enable Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        When enabled, users will receive push notifications on transactions, deposits, and broadcasts
                                    </p>
                                </div>
                                <Switch
                                    checked={data.enabled}
                                    onCheckedChange={(checked) => setData("enabled", checked)}
                                />
                            </div>

                            {/* Current Credentials Summary if exists */}
                            {settings.has_credentials && (
                                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-semibold text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        Credentials currently loaded
                                    </div>
                                    <div className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                                        <p><strong>Project ID:</strong> {settings.project_id}</p>
                                        <p><strong>Client Email:</strong> {settings.client_email}</p>
                                        <p><strong>Private Key:</strong> RSA Key configured and valid</p>
                                    </div>
                                </div>
                            )}

                            {/* Guide Callout */}
                            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 text-xs text-blue-800 dark:text-blue-300 space-y-2">
                                <div className="flex items-center gap-2 font-semibold">
                                    <Info className="h-4 w-4" />
                                    How to obtain your Service Account JSON from Firebase:
                                </div>
                                <ol className="list-decimal list-inside space-y-1 pl-2">
                                    <li>Go to the <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-medium">Firebase Console</a></li>
                                    <li>Select your project &rarr; Click the <strong>Settings Gear</strong> icon &rarr; <strong>Project settings</strong></li>
                                    <li>Click on the <strong>Service accounts</strong> tab</li>
                                    <li>Click <strong>Generate new private key</strong> &rarr; Confirm to download the JSON file</li>
                                    <li>Upload or paste the JSON content below</li>
                                </ol>
                            </div>

                            {/* Upload File Input */}
                            <div className="space-y-2">
                                <Label htmlFor="service_account_file" className="text-sm font-medium">
                                    Upload Service Account File (.json)
                                </Label>
                                <Input
                                    id="service_account_file"
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData("service_account_file", e.target.files[0]);
                                        }
                                    }}
                                />
                                {errors.service_account_file && (
                                    <p className="text-xs text-destructive">{errors.service_account_file}</p>
                                )}
                            </div>

                            {/* Or Paste JSON text */}
                            <div className="space-y-2">
                                <Label htmlFor="service_account_json" className="text-sm font-medium">
                                    Or Paste Service Account JSON Directly
                                </Label>
                                <Textarea
                                    id="service_account_json"
                                    placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", ...}'
                                    rows={5}
                                    value={data.service_account_json}
                                    onChange={(e) => setData("service_account_json", e.target.value)}
                                    className="font-mono text-xs"
                                />
                                {errors.service_account_json && (
                                    <p className="text-xs text-destructive">{errors.service_account_json}</p>
                                )}
                            </div>

                            {/* Submit & Test Buttons */}
                            <div className="flex flex-wrap gap-3 pt-2">
                                <Button type="submit" disabled={processing} className="gap-2">
                                    <UploadCloud className="h-4 w-4" />
                                    {processing ? "Saving Settings..." : "Save Settings"}
                                </Button>

                                {settings.has_credentials && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleTestNotification}
                                        disabled={isTesting}
                                        className="gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        {isTesting ? "Sending Test..." : "Send Test Notification"}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
