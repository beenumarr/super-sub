import { useForm, usePage } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { useState, useEffect } from "react";
import SelectInput from "@/Components/SelectInput";
import SelectInputRounded from "@/Components/SelectInputRounded";
import {
    Alert,
    CircularProgress,
    Box,
    Card,
    Typography,
    Divider,
} from "@mui/material";
import { CheckCircle, Error, AccountBalance } from "@mui/icons-material";
import notify from "@/Components/Toast";
import axios from "axios";

export default function AccountSettingsTab() {
    const user = usePage().props.auth.user;
    const banksData = usePage().props.banks;
    const [success, setSuccess] = useState(false);
    const [validating, setValidating] = useState(false);
    const [accountVerified, setAccountVerified] = useState(false);
    const [verificationError, setVerificationError] = useState("");
    const [showForm, setShowForm] = useState(false);

    // Format banks for the dropdown
    const banks = Object.entries(banksData).map(([name, code]) => ({
        name,
        code,
    }));

    const { data, setData, patch, errors, processing, reset } = useForm({
        account_number: user.bank_account_number || "",
        account_name: user.bank_account_name || "",
        bank_name: user.bank_account_bank || "",
        bank_code: user.bank_account_bank_code || "",
    });

    // Check if user has existing bank account
    const hasExistingBankAccount =
        user.bank_account_number &&
        user.bank_account_name &&
        user.bank_account_bank_code;

    // Set account as verified if user already has bank details
    useEffect(() => {
        if (hasExistingBankAccount && !showForm) {
            setAccountVerified(true);
        }
    }, [hasExistingBankAccount, showForm]);

    // Reset verification status when account number or bank changes
    useEffect(() => {
        if (showForm) {
            setAccountVerified(false);
            setVerificationError("");
        }
    }, [data.account_number, data.bank_code, showForm]);

    const verifyAccount = async () => {
        if (!data.account_number || !data.bank_code) {
            setVerificationError(
                "Please enter both account number and select a bank"
            );
            return;
        }

        if (data.account_number.length < 10) {
            setVerificationError("Account number must be at least 10 digits");
            return;
        }

        setValidating(true);
        setVerificationError("");

        try {
            const response = await axios.post("/profile/verify-bank-account", {
                account_number: data.account_number,
                bank_code: data.bank_code,
            });

            if (response.data.status === "success") {
                setData("account_name", response.data.data.account_name);
                setAccountVerified(true);
                notify("success", "Account verified successfully");
            } else {
                setVerificationError(
                    response.data.message || "Failed to verify account"
                );
                setAccountVerified(false);
            }
        } catch (error) {
            console.error("Verification error:", error);
            setVerificationError(
                error.response?.data?.message ||
                    "Failed to verify account. Please check your details."
            );
            setAccountVerified(false);
        } finally {
            setValidating(false);
        }
    };

    const submitAccountSettings = (e) => {
        e.preventDefault();

        if (!accountVerified) {
            notify("error", "Please verify your account details first");
            return;
        }

        patch(route("profile.update-bank-account"), {
            onSuccess: () => {
                setSuccess(true);
                notify("success", "Bank account details updated successfully");
                setTimeout(() => setSuccess(false), 3000);
                setShowForm(false); // Hide form after successful update
            },
            onError: (errors) => {
                Object.keys(errors).forEach((key) => {
                    notify("error", errors[key]);
                });
            },
        });
    };

    const handleBankChange = (e) => {
        const selectedBank = banks.find((bank) => bank.code === e.target.value);
        setData({
            ...data,
            bank_code: e.target.value,
            bank_name: selectedBank ? selectedBank.name : "",
        });
    };

    const handleEditAccount = () => {
        setShowForm(true);
        // When editing existing account, don't mark as verified until re-verified
        if (hasExistingBankAccount) {
            setAccountVerified(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-medium mb-4">Account Settings</h3>
            <p className="text-sm text-gray-600 mb-6">
                Update your banking information for withdrawals and payments.
            </p>

            {hasExistingBankAccount && !showForm ? (
                <Card className="p-4 mb-6 border border-gray-200">
                    <div className="flex items-start">
                        <div className="flex-grow">
                            <Typography variant="h6">
                                Your Bank Account
                            </Typography>
                            <Divider className="my-2" />
                            <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                    >
                                        Bank Name
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        className="font-medium"
                                    >
                                        {user.bank_account_bank}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                    >
                                        Account Number
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        className="font-medium"
                                    >
                                        {user.bank_account_number}
                                    </Typography>
                                </div>
                                <div className="col-span-2">
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                    >
                                        Account Name
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        className="font-medium"
                                    >
                                        {user.bank_account_name}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-start">
                        <PrimaryButton
                            type="button"
                            onClick={handleEditAccount}
                        >
                            Edit Account Details
                        </PrimaryButton>
                    </div>
                </Card>
            ) : (
                <form onSubmit={submitAccountSettings} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="bank_code" value="Bank Name" />
                        <SelectInputRounded
                            id="bank_code"
                            value={data.bank_code}
                            onChange={handleBankChange}
                            className="mt-1 block w-full"
                        >
                            <option value="">Select a bank</option>
                            {banks.map((bank) => (
                                <option key={bank.code} value={bank.code}>
                                    {bank.name}
                                </option>
                            ))}
                        </SelectInputRounded>
                        <InputError
                            message={errors.bank_code}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="account_number"
                            value="Account Number"
                        />
                        <div className="flex mt-1 gap-2">
                            <TextInput
                                id="account_number"
                                value={data.account_number}
                                onChange={(e) =>
                                    setData("account_number", e.target.value)
                                }
                                className="block w-full"
                                placeholder="Enter your account number"
                                maxLength={10}
                            />

                            <div className="mt-4 text-start">
                                <PrimaryButton
                                    type="button"
                                    onClick={verifyAccount}
                                    disabled={
                                        validating ||
                                        !data.account_number ||
                                        !data.bank_code
                                    }
                                    className="whitespace-nowrap"
                                >
                                    {validating ? (
                                        <>
                                            <CircularProgress
                                                size={16}
                                                color="inherit"
                                                className="mr-2"
                                            />
                                            Verifying...
                                        </>
                                    ) : accountVerified ? (
                                        <>
                                            <CheckCircle
                                                fontSize="small"
                                                className="mr-1"
                                            />
                                            Verified
                                        </>
                                    ) : (
                                        "Verify Account"
                                    )}
                                </PrimaryButton>
                            </div>
                        </div>
                        <InputError
                            message={errors.account_number}
                            className="mt-2"
                        />
                    </div>

                    {verificationError && (
                        <Alert
                            severity="error"
                            icon={<Error fontSize="inherit" />}
                            className="mt-2"
                        >
                            {verificationError}
                        </Alert>
                    )}

                    <div>
                        <InputLabel
                            htmlFor="account_name"
                            value="Account Name"
                        />
                        <TextInput
                            id="account_name"
                            value={data.account_name}
                            className="mt-1 block w-full bg-gray-100"
                            disabled={true}
                            placeholder="Verified account name will appear here"
                        />
                        {accountVerified && (
                            <div className="mt-1 text-sm text-green-600 flex items-center">
                                <CheckCircle
                                    fontSize="small"
                                    className="mr-1"
                                />
                                Account verified
                            </div>
                        )}
                        <InputError
                            message={errors.account_name}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {hasExistingBankAccount && (
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="border border-gray-300 text-gray-700 p-2 px-4 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        )}
                        <PrimaryButton
                            type="submit"
                            disabled={processing || !accountVerified}
                        >
                            {processing ? "Updating..." : "Update Account"}
                        </PrimaryButton>

                        {success && (
                            <span className="text-sm text-green-600">
                                Account information updated successfully!
                            </span>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}
