import { useForm, usePage } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import * as Yup from "yup";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface UserFieldProps {
    handleClose: (value: boolean) => void;
    editData?: any;
}

export default function UserField({ handleClose, editData }: UserFieldProps) {
    const { roles, packages } = usePage().props;
    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
    });

    const { data, setData, post, put, processing, setError, errors } =
        useForm({
            userId: editData?.id ?? "",
            user_package_id: editData?.package_id ?? "",
            name: editData?.name ?? "",
            address: editData?.address ?? "",
            phone: editData?.phone ?? "",
            email: editData?.email ?? "",
            role: editData?.role?.id ?? "",
            password: "",
            password_confirmation: "",
            active: editData?.active ?? false,
        });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        validationSchema
            .validate(data, { abortEarly: false })
            .then(() => {
                if (editData?.id) {
                    put(route("users.update", { user: editData.id }), {
                        onSuccess: () => {
                            toast.success("User updated successfully");
                            handleClose(false);
                        },
                        onError: (errors: Record<string, any>) => {
                            Object.values(errors)
                                .flat()
                                .forEach((err: any) => toast.error(err));
                        },
                    });
                } else {
                    post(route("users.store"), {
                        onSuccess: () => {
                            toast.success("User added successfully");
                            handleClose(false);
                        },
                        onError: (errors: Record<string, any>) => {
                            Object.values(errors)
                                .flat()
                                .forEach((err: any) => toast.error(err));
                        },
                    });
                }
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
                    Select User Role
                </label>
                <Select
                    value={String(data.role)}
                    onValueChange={(value) => setData("role", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.isArray(roles) && roles?.map((role: any) => (
                            <SelectItem key={role.id} value={String(role.id)}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.role && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.role}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                </label>
                <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    placeholder="Enter full name"
                />
                {errors.name && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                </label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    disabled={!!editData?.email}
                    placeholder="Enter email"
                />
                {errors.email && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                </label>
                <Input
                    id="phone"
                    type="text"
                    value={data.phone}
                    onChange={(e) => setData("phone", e.target.value)}
                    placeholder="Enter phone number"
                />
                {errors.phone && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.phone}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                </label>
                <Input
                    id="address"
                    type="text"
                    value={data.address}
                    onChange={(e) => setData("address", e.target.value)}
                    placeholder="Enter address"
                />
                {errors.address && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.address}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select User Package
                </label>
                <Select
                    value={String(data.user_package_id)}
                    onValueChange={(value) =>
                        setData("user_package_id", value)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select package" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.isArray(packages) && packages?.map((pkg: any) => (
                            <SelectItem key={pkg.id} value={String(pkg.id)}>
                                {pkg.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!editData && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            placeholder="Enter password"
                        />
                        {errors.password && (
                            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                                {errors.password}
                            </p>
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
                </>
            )}

            <div className="flex items-center space-x-3 py-4 border-t dark:border-gray-800">
                <Switch
                    id="active"
                    checked={Boolean(data.active)}
                    onCheckedChange={(checked) =>
                        setData("active", checked)
                    }
                />
                <label
                    htmlFor="active"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                    {Boolean(data.active) ? "Active" : "Disabled"}
                </label>
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
                <Button
                    type="submit"
                    disabled={processing}
                    className="gap-2"
                >
                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editData?.id ? "Update" : "Create"}
                </Button>
            </div>
        </form>
    );
}
