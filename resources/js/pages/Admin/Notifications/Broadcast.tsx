import React, { useState, useEffect } from "react";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Users, Smartphone, AlertCircle, CheckCircle2, Search, Settings } from "lucide-react";
import toast from "react-hot-toast";
import { type BreadcrumbItem } from "@/types";

interface BroadcastProps {
    broadcasts: {
        data: Array<{
            id: number;
            title: string;
            body: string;
            target_type: string;
            status: string;
            sent_count: number;
            created_at: string;
            admin?: { name: string; email: string };
            target_user?: { name: string; email: string };
        }>;
        links: Array<{ url: string | null; label: string; active: boolean }>;
        current_page: number;
        total: number;
    };
    stats: {
        total_users: number;
        registered_devices: number;
        users_with_devices: number;
        firebase_configured: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/admin/dashboard" },
    { title: "Push Notifications", href: "/admin/notifications/broadcast" },
    { title: "Broadcast", href: "/admin/notifications/broadcast" },
];

export default function Broadcast({ broadcasts, stats }: BroadcastProps) {
    const { flash } = usePage().props as any;

    const { data, setData, post, processing, reset, errors } = useForm({
        target_type: "all",
        target_user_id: "",
        title: "",
        body: "",
    });

    const [userQuery, setUserQuery] = useState("");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.warning) toast.warning(flash.warning);
    }, [flash]);

    // Search users for targeted push
    useEffect(() => {
        if (userQuery.trim().length < 2) {
            setUserResults([]);
            return;
        }

        const delay = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/admin/notifications/users-search?query=${encodeURIComponent(userQuery)}`);
                const json = await res.json();
                setUserResults(json);
            } catch (e) {
                console.error(e);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [userQuery]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.target_type === "user" && !data.target_user_id) {
            toast.error("Please select a recipient user");
            return;
        }

        post("/admin/notifications/broadcast", {
            onSuccess: () => {
                reset("title", "body", "target_user_id");
                setSelectedUser(null);
                setUserQuery("");
            },
            onError: (errs) => {
                Object.values(errs).flat().forEach((err: any) => toast.error(String(err)));
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Push Notification Broadcast" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                {/* Header & Status Banner */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Push Notification Broadcast</h1>
                        <p className="text-sm text-muted-foreground">
                            Compose and broadcast push notifications directly to user mobile devices
                        </p>
                    </div>

                    {!stats.firebase_configured && (
                        <Link href="/admin/notifications/settings">
                            <Button variant="outline" className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50">
                                <AlertCircle className="h-4 w-4" />
                                Firebase Not Configured (Click to Setup)
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Registered Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_users.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Registered platform accounts</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Device Tokens</CardTitle>
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.registered_devices.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Across {stats.users_with_devices.toLocaleString()} active users
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">FCM Service Status</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">
                                    {stats.firebase_configured ? "Active" : "Disabled"}
                                </span>
                                {stats.firebase_configured ? (
                                    <Badge className="bg-emerald-500 text-white">Online</Badge>
                                ) : (
                                    <Badge variant="destructive">Setup Needed</Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.firebase_configured ? "Ready to dispatch push alerts" : "Configure service credentials"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Compose Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Bell className="h-5 w-5 text-primary" />
                            Compose Notification
                        </CardTitle>
                        <CardDescription>
                            Send instant alerts to all mobile app installations or a specific customer
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Target Type Selector */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Target Audience *</Label>
                                <div className="grid grid-cols-2 gap-3 max-w-md">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData("target_type", "all");
                                            setData("target_user_id", "");
                                            setSelectedUser(null);
                                        }}
                                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 font-medium transition text-sm ${
                                            data.target_type === "all"
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border hover:border-primary/40"
                                        }`}
                                    >
                                        <Users className="h-4 w-4" />
                                        All Users (Broadcast)
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setData("target_type", "user")}
                                        className={`flex items-center justify-center gap-2 rounded-lg border-2 p-3 font-medium transition text-sm ${
                                            data.target_type === "user"
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border hover:border-primary/40"
                                        }`}
                                    >
                                        <Smartphone className="h-4 w-4" />
                                        Specific User
                                    </button>
                                </div>
                            </div>

                            {/* Specific User Search */}
                            {data.target_type === "user" && (
                                <div className="space-y-2 max-w-lg">
                                    <Label className="text-sm font-medium">Search Recipient *</Label>
                                    {selectedUser ? (
                                        <div className="flex items-center justify-between rounded-lg border border-primary/40 bg-primary/5 p-3">
                                            <div>
                                                <p className="font-semibold text-sm">{selectedUser.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedUser.email} • {selectedUser.phone_number || "No phone"}
                                                </p>
                                                <p className="text-xs text-emerald-600 font-medium mt-1">
                                                    {selectedUser.device_tokens_count} active device(s)
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(null);
                                                    setData("target_user_id", "");
                                                }}
                                            >
                                                Change
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by name, email, or phone number..."
                                                value={userQuery}
                                                onChange={(e) => setUserQuery(e.target.value)}
                                                className="pl-9"
                                            />
                                            {isSearching && (
                                                <p className="text-xs text-muted-foreground mt-1">Searching users...</p>
                                            )}
                                            {userResults.length > 0 && (
                                                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-auto">
                                                    {userResults.map((u) => (
                                                        <div
                                                            key={u.id}
                                                            onClick={() => {
                                                                setSelectedUser(u);
                                                                setData("target_user_id", u.id.toString());
                                                                setUserResults([]);
                                                                setUserQuery("");
                                                            }}
                                                            className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-medium">{u.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {u.email} • {u.phone_number}
                                                                </p>
                                                            </div>
                                                            <Badge variant="outline" className="text-xs">
                                                                {u.device_tokens_count} device(s)
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notification Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-medium">
                                    Notification Title *
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. System Maintenance Notice, Weekend Data Offer"
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                    maxLength={120}
                                    required
                                />
                                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                            </div>

                            {/* Notification Body */}
                            <div className="space-y-2">
                                <Label htmlFor="body" className="text-sm font-medium">
                                    Message Body *
                                </Label>
                                <Textarea
                                    id="body"
                                    placeholder="Enter the notification message that will appear on the user's phone lock screen and banner..."
                                    rows={4}
                                    value={data.body}
                                    onChange={(e) => setData("body", e.target.value)}
                                    maxLength={500}
                                    required
                                />
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>Emojis are automatically omitted to maintain standard formatting.</span>
                                    <span>{data.body.length}/500</span>
                                </div>
                                {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
                            </div>

                            {/* Action Button */}
                            <Button type="submit" disabled={processing} className="gap-2">
                                <Send className="h-4 w-4" />
                                {processing ? "Dispatching..." : "Send Notification"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Broadcast History</CardTitle>
                        <CardDescription>
                            Logs of previously dispatched notification broadcasts and direct alerts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {broadcasts.data.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground text-sm">
                                No notification broadcasts recorded yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                                            <th className="pb-3 pr-4">Date & Time</th>
                                            <th className="pb-3 pr-4">Title</th>
                                            <th className="pb-3 pr-4">Message</th>
                                            <th className="pb-3 pr-4">Audience</th>
                                            <th className="pb-3 pr-4">Delivered</th>
                                            <th className="pb-3 pr-4">Status</th>
                                            <th className="pb-3">Sent By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {broadcasts.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/50">
                                                <td className="py-3 pr-4 whitespace-nowrap text-xs text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleString()}
                                                </td>
                                                <td className="py-3 pr-4 font-medium max-w-[180px] truncate">
                                                    {item.title}
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground max-w-[280px] truncate">
                                                    {item.body}
                                                </td>
                                                <td className="py-3 pr-4 whitespace-nowrap">
                                                    {item.target_type === "all" ? (
                                                        <Badge variant="secondary">All Users</Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            {item.target_user?.name || "Specific User"}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 whitespace-nowrap text-xs">
                                                    {item.sent_count} device(s)
                                                </td>
                                                <td className="py-3 pr-4 whitespace-nowrap">
                                                    {item.status === "sent" ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
                                                            <AlertCircle className="h-3.5 w-3.5" /> {item.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                    {item.admin?.name || "System"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
