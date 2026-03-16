import { useForm } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import * as Yup from "yup";

interface UserPasswordFieldProps {
    handleClose: (value: boolean) => void;
    editData: any;
}

export default function UserPasswordField({
    handleClose,
    editData,
}: UserPasswordFieldProps) {
    const validationSchema = Yup.object().shape({
        password: Yup.string().required("Password is required"),
        password_confirmation: Yup.string().oneOf(
            [Yup.ref("password")],
            "Passwords do not match"
        ),
    });

    const { data, setData, put, processing, setError, errors } = useForm({
        userId: editData?.id ?? "",
        name: editData?.name ?? "",
        phone: editData?.phone ?? "",
        email: editData?.email ?? "",
        password: "",
        password_confirmation: "",
        password_reset: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        validationSchema
            .validate(data, { abortEarly: false })
            .then(() => {
                put(route("users.update", { user: editData.id }), {
                    onSuccess: () => {
                        toast.success("User password updated successfully");
                        handleClose(false);
                    },
                    onError: (errors: Record<string, any>) => {
                        Object.values(errors)
                            .flat()
                            .forEach((err: any) => toast.error(err));
                    },
                });
            })
            .catch((err: any) => {
                const formattedErrors = err?.inner?.reduce(
                    (acc: Record<string, string>, curr: any) => {
                        acc[curr.path] = curr.message;
                        return acc;
                    },
                    {}
                );
                setError(formattedErrors);
            });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                </label>
                <Input
                    type="text"
                    value={data.name}
                    disabled={true}
                    readOnly={true}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                </label>
                <Input
                    type="email"
                    value={data.email}
                    disabled={true}
                    readOnly={true}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                </label>
                <Input
                    type="text"
                    value={data.phone}
                    disabled={true}
                    readOnly={true}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                </label>
                <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    placeholder="Enter new password"
                />
                {errors.password && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.password}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                </label>
                <Input
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData("password_confirmation", e.target.value)
                    }
                    placeholder="Confirm password"
                />
                {errors.password_confirmation && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {errors.password_confirmation}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t dark:border-gray-800">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleClose(false)}
                    disabled={processing}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing} className="gap-2">
                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Update Password
                </Button>
            </div>
        </form>
    );
}
