import React, { useEffect, useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import TransactionTable from "./Components/TransactionTable";
import PromotionTable from "./Components/PromotionTable";
import { usePrevious } from "react-use";
import { type BreadcrumbItem } from "@/types";

export default function Index(props) {
    const [filterValues, setFilterValue] = useState({
        page: 1,
        pageSize: 20,
        transaction_type: "",
        search: "",
        status: "",
        user_id: "",
        from: "",
        to: "",
    });
    const { transactions, configs_values, promotions } = usePage().props as any;

    const { data, setData, put, processing, errors, reset } = useForm({
        ...configs_values,
    });

    const promoForm = useForm({
        code: "",
        reward_amount: "",
        max_redemptions: "",
        start_immediately: true,
    });

    const handleOnChange = (event) => {
        setData({
            ...data,
            [event.target.name]: event.target.value,
        });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route("app_configurations.update", { app_configuration: 1 }, false), {
            onSuccess: () => {
                toast.success("Configuration Updated Successfully");
            },
            onError: (errors: any) => {
                Object.values(errors)
                    .flat()
                    .forEach((err: any) => toast.error(String(err)));
            },
        });
    };

    const submitPromo = (e: React.FormEvent) => {
        e.preventDefault();

        promoForm.post(route("admin.promotions.store", undefined, false), {
            onSuccess: () => {
                toast.success("Promo created");
                promoForm.reset();
                promoForm.setData("start_immediately", true);
            },
            onError: (errors: any) => {
                Object.values(errors)
                    .flat()
                    .forEach((err: any) => toast.error(String(err)));
            },
        });
    };

    const setPaginationModel = (val) => {
        setFilterValue({
            ...filterValues,
            page: Number(val.page) + 1,
            pageSize: val.pageSize,
        });
    };

    const prevValues = usePrevious(filterValues);

    useEffect(() => {
        if (prevValues) {
            const query = Object.keys(filterValues).length
                ? filterValues
                : { remember: "forget" };

            router.get(route(route().current()), query, {
                replace: false,
                preserveState: true,
            });
        }
    }, [filterValues]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: route("dashboard") },
        { title: "Admin", href: route("admin.dashboard") },
        { title: "Referrals & Promo" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Referrals & Promo" />

            <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-8">
                <form onSubmit={submit} className="w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Referral Settings</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Configure referral and promo bonuses
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Signup Bonus (₦)</label>
                                    <Input
                                        type="number"
                                        name="signup_bonus_amount"
                                        value={data["signup_bonus_amount"]}
                                        onChange={handleOnChange}
                                        placeholder="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={Boolean(data["signup_bonus_enable"])}
                                        onCheckedChange={(checked) => {
                                            setData({
                                                ...data,
                                                signup_bonus_enable: checked,
                                            });
                                        }}
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {data.signup_bonus_enable
                                            ? "Enabled"
                                            : "Disabled"}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Referral Bonus (₦)</label>
                                    <Input
                                        type="number"
                                        name="referral_bonus_amount"
                                        value={data["referral_bonus_amount"]}
                                        onChange={handleOnChange}
                                        placeholder="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={Boolean(data["referral_bonus_enable"])}
                                        onCheckedChange={(checked) => {
                                            setData({
                                                ...data,
                                                referral_bonus_enable: checked,
                                            });
                                        }}
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {data["referral_bonus_enable"]
                                            ? "Enabled"
                                            : "Disabled"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={Boolean(data["bonus_withdrawal_enable"])}
                                    onCheckedChange={(checked) => {
                                        setData({
                                            ...data,
                                            bonus_withdrawal_enable: checked,
                                        });
                                    }}
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Bonus Withdrawal</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {data.bonus_withdrawal_enable
                                        ? "Enabled"
                                        : "Disabled"}
                                </span>
                            </div>

                            <Button type="submit" disabled={processing} className="mt-6">
                                {processing ? "Saving..." : "Update Settings"}
                            </Button>
                        </CardContent>
                    </Card>
                </form>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Promo Campaigns</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Create and start promos users can redeem (bonus wallet funding)
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <form onSubmit={submitPromo} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Promo Code</label>
                                    <Input
                                        name="code"
                                        value={promoForm.data.code}
                                        onChange={(e) => promoForm.setData("code", e.target.value)}
                                        placeholder="e.g. APRILBONUS"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Reward Amount (₦)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        name="reward_amount"
                                        value={promoForm.data.reward_amount}
                                        onChange={(e) => promoForm.setData("reward_amount", e.target.value)}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Max Redeems</label>
                                    <Input
                                        type="number"
                                        name="max_redemptions"
                                        value={promoForm.data.max_redemptions}
                                        onChange={(e) => promoForm.setData("max_redemptions", e.target.value)}
                                        placeholder="100"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={Boolean(promoForm.data.start_immediately)}
                                    onCheckedChange={(checked) => promoForm.setData("start_immediately", checked)}
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {promoForm.data.start_immediately ? "Start immediately" : "Create as draft"}
                                </span>
                            </div>

                            <Button type="submit" disabled={promoForm.processing}>
                                {promoForm.processing ? "Creating..." : "Create Promo"}
                            </Button>
                        </form>

                        <PromotionTable promotions={promotions ?? []} />
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Referral and Bonus History</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            View all referral transactions and bonus activities
                        </p>
                    </CardHeader>

                    <CardContent>

                        <TransactionTable
                            data={transactions}
                            setViewDetailModal={undefined}
                            paginationModel={{
                                page: filterValues.page - 1,
                                pageSize: filterValues.pageSize,
                            }}
                            setPaginationModel={setPaginationModel}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
