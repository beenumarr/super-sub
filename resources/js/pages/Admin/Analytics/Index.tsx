import { Head } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import UserTransactionSummary from "./Users/Index";
import { type BreadcrumbItem } from "@/types";

export default function Index(props: any) {
    const [activeTab, setActiveTab] = useState("summary");

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: route("dashboard") },
        { title: "Analytics", href: route("admin.dashboard") },
    ];

    const tabLinks = [
        { title: "Transaction Summary", page: "summary" },
        { title: "User Retention", page: "retention" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />
            <div className="mx-auto w-full px-4 pt-10 sm:px-6 lg:px-8">
                <div className="flex flex-col w-full">
                    <header className="flex px-3 border-b dark:border-gray-800 border-t dark:border-gray-800">
                        <ul className="flex">
                            {tabLinks.map((item) => (
                                <li key={item.page}>
                                    <button
                                        onClick={() => setActiveTab(item.page)}
                                        className={`py-3 px-4 border-b-2 text-sm font-medium transition-colors ${
                                            activeTab === item.page
                                                ? "border-blue-500 text-gray-900 dark:text-white"
                                                : "border-transparent text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                    >
                                        {item.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </header>

                    <section>
                        {activeTab === "summary" && <UserTransactionSummary />}
                        {activeTab === "retention" && (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                                User Retention analytics coming soon...
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
