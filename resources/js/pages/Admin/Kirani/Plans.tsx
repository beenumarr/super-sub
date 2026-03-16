import React, { useState, useEffect } from "react";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { type BreadcrumbItem } from "@/types";

interface Plan {
    id: number;
    size: number;
    amount: number;
    smart_earner_amount?: number;
    affiliate_amount?: number;
    top_user_amount?: number;
    api_amount?: number;
    active: boolean;
    created_at?: string;
}

export default function KiraniPlansPage() {
    const { auth, plans = [], plan_type, kirani_network, flash } = usePage().props as any;
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        size: "",
        amount: "",
        smart_earner_amount: "",
        affiliate_amount: "",
        top_user_amount: "",
        api_amount: "",
        active: true as boolean,
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
    }, [flash]);

    const openCreateModal = () => {
        reset();
        setEditingPlan(null);
        setShowModal(true);
    };

    const openEditModal = (plan: Plan) => {
        setEditingPlan(plan);
        setData({
            size: String(plan.size || ""),
            amount: String(plan.amount || ""),
            smart_earner_amount: String(plan.smart_earner_amount || ""),
            affiliate_amount: String(plan.affiliate_amount || ""),
            top_user_amount: String(plan.top_user_amount || ""),
            api_amount: String(plan.api_amount || ""),
            active: plan.active ?? true,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPlan(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingPlan) {
            put(route("admin.kirani.plans.update", editingPlan.id), {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    toast.success("Plan updated successfully");
                },
                onError: (errs) =>
                    Object.values(errs)
                        .flat()
                        .forEach((err) => toast.error(String(err))),
            });
        } else {
            post(route("admin.kirani.plans.store"), {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    toast.success("Plan created successfully");
                },
                onError: (errs) =>
                    Object.values(errs)
                        .flat()
                        .forEach((err) => toast.error(String(err))),
            });
        }
    };

    const handleDelete = (plan: Plan) => {
        if (confirm(`Are you sure you want to delete the ${plan.size} Minutes plan?`)) {
            router.delete(route("admin.kirani.plans.destroy", plan.id), {
                preserveScroll: true,
                onSuccess: () => toast.success("Plan deleted successfully"),
                onError: () => toast.error("Failed to delete plan"),
            });
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: route("dashboard") },
        { title: "Admin", href: route("admin.dashboard") },
        { title: "Kirani", href: route("admin.kirani") },
        { title: "Plans" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kirani Plans" />

            <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Manage Kirani Minutes Plans</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Add, edit, or remove minutes plans for Kirani users
                            </p>
                        </div>
                        <Button onClick={openCreateModal} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Plan
                        </Button>
                    </CardHeader>

                    <CardContent>
                        {/* Plans Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200 dark:border-gray-700">
                                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Minutes
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Amount (₦)
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Smart Earner
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Affiliate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Top User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {plans.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                                No plans found. Click "Add Plan" to create one.
                                            </td>
                                        </tr>
                                    ) : (
                                        plans.map((plan: Plan) => (
                                            <tr key={plan.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {plan.size} Minutes
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    ₦{Number(plan.amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                    ₦{Number(plan.smart_earner_amount || plan.amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                    ₦{Number(plan.affiliate_amount || plan.amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                    ₦{Number(plan.top_user_amount || plan.amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                                                            plan.active
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                                                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                                                        }`}
                                                    >
                                                        {plan.active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openEditModal(plan)}
                                                            className="gap-1"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDelete(plan)}
                                                            className="gap-1"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPlan ? "Edit Plan" : "Add New Plan"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPlan
                                ? "Update the plan details"
                                : "Create a new minutes plan for Kirani users"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Minutes (Size) */}
                        <div className="space-y-1">
                            <label htmlFor="size" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Minutes *
                            </label>
                            <Input
                                id="size"
                                type="number"
                                value={data.size}
                                onChange={(e) => setData("size", e.target.value)}
                                placeholder="e.g. 100, 500, 1000"
                                required
                            />
                            {errors.size && (
                                <span className="text-sm text-red-600 dark:text-red-400">{errors.size}</span>
                            )}
                        </div>

                        {/* Amount */}
                        <div className="space-y-1">
                            <label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Amount (₦) *
                            </label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData("amount", e.target.value)}
                                placeholder="Enter amount"
                                required
                            />
                            {errors.amount && (
                                <span className="text-sm text-red-600 dark:text-red-400">{errors.amount}</span>
                            )}
                        </div>

                        {/* Package Amounts */}
                        <div className="space-y-3 border rounded-md p-3 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Package Pricing (Optional)</p>

                            <div className="space-y-1">
                                <label htmlFor="smart_earner" className="text-xs text-gray-600 dark:text-gray-400">
                                    Smart Earner Amount
                                </label>
                                <Input
                                    id="smart_earner"
                                    type="number"
                                    step="0.01"
                                    value={data.smart_earner_amount}
                                    onChange={(e) =>
                                        setData("smart_earner_amount", e.target.value)
                                    }
                                    placeholder="Leave empty to use main amount"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="affiliate" className="text-xs text-gray-600 dark:text-gray-400">
                                    Affiliate Amount
                                </label>
                                <Input
                                    id="affiliate"
                                    type="number"
                                    step="0.01"
                                    value={data.affiliate_amount}
                                    onChange={(e) =>
                                        setData("affiliate_amount", e.target.value)
                                    }
                                    placeholder="Leave empty to use main amount"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="top_user" className="text-xs text-gray-600 dark:text-gray-400">
                                    Top User Amount
                                </label>
                                <Input
                                    id="top_user"
                                    type="number"
                                    step="0.01"
                                    value={data.top_user_amount}
                                    onChange={(e) =>
                                        setData("top_user_amount", e.target.value)
                                    }
                                    placeholder="Leave empty to use main amount"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="api_amount" className="text-xs text-gray-600 dark:text-gray-400">
                                    API Amount
                                </label>
                                <Input
                                    id="api_amount"
                                    type="number"
                                    step="0.01"
                                    value={data.api_amount}
                                    onChange={(e) =>
                                        setData("api_amount", e.target.value)
                                    }
                                    placeholder="Leave empty to use main amount"
                                />
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center gap-3">
                            <Switch
                                id="active"
                                checked={data.active}
                                onCheckedChange={(checked) =>
                                    setData("active", checked)
                                }
                            />
                            <label
                                htmlFor="active"
                                className="text-sm font-medium text-gray-700 dark:text-gray-200"
                            >
                                Active
                            </label>
                        </div>

                        {/* Actions */}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {processing
                                    ? "Saving..."
                                    : editingPlan
                                    ? "Update Plan"
                                    : "Create Plan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

