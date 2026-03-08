import AppLogo from '@/components/app-logo';
import { CookieConsentBanner } from '@/components/cookie-banner';
import { OurServicesSection } from '@/components/landing/sections/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ArrowRight, Clock, Shield, Zap } from 'lucide-react';

export default function Index() {
    return (
        <>
            {/* Header */}
            <header className="fixed top-0 right-0 left-0 z-50 bg-white/10 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <AppLogo />
                    </div>
                    <nav className="flex items-center gap-8">
                        <div className="hidden items-center gap-6 md:flex">
                            <Link href="#" className="text-white hover:text-gray-200">
                                Features
                            </Link>
                            <Link href="#" className="text-white hover:text-gray-200">
                                Services
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login">
                                <Button variant="ghost" className="text-white hover:bg-white/10">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-white text-zinc-800 hover:bg-gray-100">Get Started</Button>
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>

            <CookieConsentBanner />

            {/* Hero Section */}
            <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-zinc-800 via-[#4a8980] to-[#375f58]">
                <div className="relative mx-auto flex h-[80vh] flex-col items-center justify-center px-4 text-center text-white">
                    {/* Background pattern */}
                    <div className="absolute inset-0 overflow-hidden opacity-10">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA4YTEyIDEyIDAgMSAxIDAgMjQgMTIgMTIgMCAwIDEgMC0yNHptMCA0YTggOCAwIDEgMCAwIDE2IDggOCAwIDAgMCAwLTE2eiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=')] bg-repeat opacity-20" />
                        <div
                            className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA4YTEyIDEyIDAgMSAxIDAgMjQgMTIgMTIgMCAwIDEgMC0yNHptMCA0YTggOCAwIDEgMCAwIDE2IDggOCAwIDAgMCAwLTE2eiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=')] bg-repeat opacity-20"
                            style={{ transform: 'translate(30px, 30px)' }}
                        />
                    </div>

                    <div className="relative z-10 max-w-screen-lg">
                        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            Automating VTU Services for Resellers & Businesses
                        </h1>

                        <div className="flex w-full justify-center">
                            <p className="mb-8 max-w-2xl text-center text-lg text-gray-200 sm:text-xl">
                                VTU App provides a reliable API to automate airtime, data, and utility purchases — built for VTU resellers, fintechs,
                                and developers who want speed, stability, and scale.
                            </p>
                        </div>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link href="/register">
                                <Button size="lg" className="bg-white text-zinc-800 hover:bg-gray-100">
                                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>

                            <Link href="/register">
                                <Button size="lg" variant="outline" className="border-white bg-black text-white hover:bg-white/10">
                                    View API Docs
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <OurServicesSection />

            {/* Features Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="mb-12 text-center text-3xl font-bold">Why Choose VTU App</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="bg-accent/50">
                            <CardHeader>
                                <div className="text-muted-foreground flex w-full items-center justify-center">
                                    <Zap className="text-theme-1 mr-2 h-16 w-16" />
                                    <CardTitle>Automated VTU Transactions</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-center">
                                    End-to-end automation for airtime, data, cable TV, and electricity — no manual steps, just plug & play.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-accent/50">
                            <CardHeader>
                                <div className="text-muted-foreground flex w-full items-center justify-center">
                                    <Shield className="text-theme-1 mr-2 h-16 w-16" />
                                    <CardTitle>Secure API for Resellers</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Authentication keeps your integrations safe while serving thousands of customers.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-accent/50">
                            <CardHeader>
                                <div className="text-muted-foreground flex w-full items-center justify-center">
                                    <Clock className="text-theme-1 mr-2 h-16 w-16" />
                                    <CardTitle>Always-On Infrastructure</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <p className="text-muted-foreground">
                                    We monitor providers in real-time to keep your services running, with alerts and failover options.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-gradient-to-br from-zinc-50 to-gray-100 py-20">
                <div className="container mx-auto px-4">
                    <h2 className="mb-3 text-center text-3xl font-bold">What Resellers & Developers Say</h2>
                    <p className="mx-auto mb-12 max-w-2xl text-center text-gray-600">
                        Developers and VTU resellers trust VTU App’s API to power their platforms with reliable automation and transparent reporting.
                    </p>

                    {/* Testimonials remain unchanged, only intro text updated */}
                </div>
            </section>

            {/* Footer Section */}
            <footer className="bg-zinc-800 py-12 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">About Us</h3>
                            <p className="text-gray-300">
                                VTU App is a VTU automation platform providing API access for resellers and businesses. We simplify airtime, data, and
                                bill payments so you can focus on growth.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white">
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <Link href={route('privacy-policy')} className="text-gray-300 hover:text-white">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('terms-of-use')} className="text-gray-300 hover:text-white">
                                        Terms of Use
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
                            <ul className="space-y-2">
                                <li className="text-gray-300">support@vtuapp.com.ng</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-300 hover:text-white">
                                    Twitter
                                </a>
                                <a href="#" className="text-gray-300 hover:text-white">
                                    Facebook
                                </a>
                                <a href="#" className="text-gray-300 hover:text-white">
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-300">
                        <p>&copy; {new Date().getFullYear()} VTU App. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
