import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import UserInfoTab from "./Partials/UserInfoTab";
import AccountSettingsTab from "./Partials/AccountSettingsTab";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";

export default function Edit({ auth }) {
    const [activeTab, setActiveTab] = useState("userInfo");

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    User Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="flex flex-col md:flex-row py-12 px-4 sm:px-6 lg:px-8">
                {/* Sidebar - Responsive */}
                <div className="w-full md:w-1/4 mb-6 md:mb-0">
                    <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-visible">
                        <button
                            onClick={() => setActiveTab("userInfo")}
                            className={`whitespace-nowrap px-4 py-2 rounded-md text-left hover:bg-gray-200 ${
                                activeTab === "userInfo"
                                    ? "bg-gray-200 font-medium"
                                    : ""
                            }`}
                        >
                            User Info
                        </button>
                        <button
                            onClick={() => setActiveTab("accountSettings")}
                            className={`whitespace-nowrap px-4 py-2 rounded-md text-left hover:bg-gray-200 ${
                                activeTab === "accountSettings"
                                    ? "bg-gray-200 font-medium"
                                    : ""
                            }`}
                        >
                            Bank Account
                        </button>
                        <button
                            onClick={() => setActiveTab("changePassword")}
                            className={`whitespace-nowrap px-4 py-2 rounded-md text-left hover:bg-gray-200 ${
                                activeTab === "changePassword"
                                    ? "bg-gray-200 font-medium"
                                    : ""
                            }`}
                        >
                            Change Password
                        </button>
                    </nav>
                </div>

                {/* Content Area - Responsive */}
                <div className="w-full md:w-3/4 md:pl-6 space-y-6">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {activeTab === "userInfo" && <UserInfoTab />}
                        {activeTab === "accountSettings" && (
                            <AccountSettingsTab />
                        )}
                        {activeTab === "changePassword" && (
                            <UpdatePasswordForm />
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
