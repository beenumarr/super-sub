import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { Person, PersonOutline } from "@mui/icons-material";
import { BgColor, TextColor } from "@/utils/theme";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
    theme,
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route("profile.update"));
    };

    return (
        <section className={className}>
            <header>
                <div className=" flex  items-center justify-center flex-col p-2">
                    <span className=" p-2 border-2 rounded-full ">
                        <PersonOutline
                            className={` ${TextColor[theme]}`}
                            sx={{ fontSize: 100 }}
                        />
                    </span>

                    <div className="font-medium text-gray-800">{user.name}</div>
                </div>
            </header>

            <form
                onSubmit={submit}
                className={`mt-6 space-y-6 p-5 rounded-md ${BgColor[theme]}`}
            >
                <div className="flex flex-col text-theme-1">
                    <span>Email: {user.email}</span>

                    <span>Phone Number: {user.phone}</span>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2 text-gray-800 dark:text-gray-200">
                            Your email address is unverified.
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="mt-2 font-medium text-sm text-green-600 dark:text-green-400">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}
            </form>

            <div
                className={` ${BgColor[theme]} flex mt-4 p-4 rounded-md flex-col text-theme-1 `}
            >
                <span>Wallet Balance: {user.wallet.balance}</span>
            </div>
        </section>
    );
}
