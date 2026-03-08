import AppLogo from '@/components/app-logo';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-4 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="hidden h-full items-center justify-center bg-gradient-to-br from-zinc-800 via-[#4a8980] to-[#375f58] p-10 text-white lg:flex dark:border-r">
                <div className="px-10 lg:px-0">
                    <h1 className="text-center text-2xl font-extrabold text-white uppercase md:text-4xl lg:text-left lg:text-8xl">
                        Simplifying Data, Airtime & Bill Payments
                    </h1>
                    <h2 className="mt-4 text-center text-base text-white md:text-3xl lg:text-left lg:text-4xl">
                        Experience seamless transactions with our reliable platform. Fast, secure, and always available.
                    </h2>

                    <div className="mt-8 flex justify-center lg:justify-start">
                        <Link href="/" className="inline-flex items-center text-sm text-white/80 hover:text-white">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2 h-4 w-4"
                            >
                                <path d="m12 19-7-7 7-7" />
                                <path d="M19 12H5" />
                            </svg>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
            <div className="w-full lg:p-4">
                <div className="bg-accent/40 mx-auto flex w-full flex-col justify-center space-y-6 rounded-lg border p-8 shadow-sm sm:w-[450px]">
                    <div className="flex w-full items-center justify-center">
                        <div className="flex items-center">
                            <AppLogo />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center gap-2 text-center sm:items-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-muted-foreground text-sm text-balance">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
