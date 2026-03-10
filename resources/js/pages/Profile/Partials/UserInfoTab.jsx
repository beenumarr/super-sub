import PrimaryButton from "@/Components/PrimaryButton";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function UserInfoTab() {
    const user = usePage().props.auth.user;
    const [upgrading, setUpgrading] = useState(false);

    const handleUpgrade = () => {
        setUpgrading(true);
        // Add your upgrade logic here
        setTimeout(() => {
            setUpgrading(false);
        }, 2000);
    };

    return (
        <div>
            <h3 className="text-lg font-medium mb-4">KYC Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Name</span>
                        <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">Email</span>
                        <span className="font-medium">{user.email}</span>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">
                            Phone Number
                        </span>
                        <span className="font-medium">
                            {user.phone || "Not provided"}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-500">
                            Account Level
                        </span>
                        <div className="flex items-center">
                            <span className="font-medium">
                                {user.kyc_level}
                            </span>
                            <span
                                className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                    user.level === "Premium" ||
                                    user.level === "Gold"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                }`}
                            >
                                {user.kyc_level}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-2">Account Verification</h4>
                <p className="text-sm text-gray-600 mb-4">
                    Upgrade your account to unlock premium features and higher
                    transaction limits.
                </p>
                <Link href="/kyc">
                    <PrimaryButton
                        onClick={handleUpgrade}
                        disabled={upgrading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-75"
                    >
                        {upgrading ? "Processing..." : "Upgrade Account"}
                    </PrimaryButton>
                </Link>
            </div>
        </div>
    );
}
