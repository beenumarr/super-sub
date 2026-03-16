import { usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import CableTvServices from "./Components/CableTvServices";
import BillPaymentService from "./Components/BillPaymentService";
import { type BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Dashboard", href: "/admin/dashboard" },
    { title: "Service Charges", href: "/admin/service-charges" },
];

export default function Index() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service Charges" />

            <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-8">
                <div className="mb-6 space-y-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Service Charges</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Manage service charges for different providers
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <CableTvServices />
                    <BillPaymentService />
                </div>
            </div>
        </AppLayout>
    );
}
