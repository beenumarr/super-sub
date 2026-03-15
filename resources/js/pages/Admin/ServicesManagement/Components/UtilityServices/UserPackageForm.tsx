import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import type { ChangeEvent, FormEvent } from 'react';
import toast from 'react-hot-toast';

interface UserPackage {
    name: string;
    daily_spending_limit: number | string;
    active?: number | boolean;
}

interface UserPackageFormProps {
    handleClose: () => void;
    editData: UserPackage[];
}

export default function UserPackageForm({ handleClose, editData }: UserPackageFormProps) {
    const { data, setData, put, processing } = useForm<{ user_packages: { name: string; daily_spending_limit: number | string }[] }>({
        user_packages: editData,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(
            route('user_packages.update', {
                id: 1,
            }),
            {
                onSuccess: () => {
                    toast.success('Settings Updated Successfully', {
                        duration: 3000,
                    });
                    handleClose();
                },
                onError: (errors) => {
                    Object.values(errors)
                        .flat()
                        .map((err) =>
                            toast.error(err, {
                                duration: 3000,
                            }),
                        );
                },
            },
        );
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const updatedServices = data.user_packages.map((user_package) =>
            user_package.name === e.target.name
                ? {
                      ...user_package,
                      daily_spending_limit:
                          e.target.type === 'text' || e.target.type === 'number' ? e.target.value : user_package.daily_spending_limit,
                      [e.target.id]:
                          e.target.type === 'text' || e.target.type === 'number'
                              ? e.target.value
                              : // @ts-expect-error dynamic key from backend
                                user_package[e.target.id],
                  }
                : user_package,
        );
        setData({ user_packages: updatedServices });
    };

    const getValue = (name: string, key: keyof UserPackage) => {
        const user_package = data.user_packages.find((u) => u.name === name);
        // @ts-expect-error dynamic key from backend
        return user_package ? user_package[key] : undefined;
    };

    return (
        <form onSubmit={submit} className="flex h-full w-full flex-col justify-center p-3">
            {editData.map((user_package, i) => (
                <Item key={i} handleChange={handleChange} value={getValue(user_package.name, 'daily_spending_limit')} user_package={user_package} />
            ))}

            <div className="mt-4 flex items-center justify-end">
                <Button type="submit" disabled={processing}>
                    Update
                </Button>
            </div>
        </form>
    );
}

interface ItemProps {
    handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
    user_package: UserPackage;
    value: number | string;
}

function Item({ handleChange, user_package, value }: ItemProps) {
    return (
        <div className="mt-4">
            <div className="flex w-full p-2">
                <span className="mr-auto flex w-full font-medium">{user_package.name}: </span>
                <div className="flex w-full p-2">
                    <span className="mr-auto flex w-1/2">Daily Limit: </span>
                    <span className="-mt-4 ml-auto flex w-1/2 flex-col space-y-1">
                        <Label htmlFor={`limit-${user_package.name}`} className="text-xs">
                            Daily Limit (NGN)
                        </Label>
                        <Input
                            id="daily_spending_limit"
                            type="number"
                            className="h-8 w-40"
                            name={user_package.name}
                            value={value as number | string}
                            onChange={handleChange}
                        />
                    </span>
                </div>
            </div>
        </div>
    );
}
