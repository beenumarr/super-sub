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
                            <Link href="#" className="text-white hover:text-gray-200">
                                About
                            </Link>
                            <Link href="#" className="text-white hover:text-gray-200">
                                Contact
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login">
                                <Button variant="ghost" className="text-white hover:bg-white/10">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-white text-zinc-800 hover:bg-gray-100">Register</Button>
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>

            <CookieConsentBanner />

            {/* Hero Section */}
            <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-zinc-800 via-[#4a8980] to-[#375f58]">
                <div className="relative mx-auto flex h-[80vh] flex-col items-center justify-center px-4 text-center text-white">
                    {/* Network Pattern Background */}
                    <div className="absolute inset-0 overflow-hidden opacity-10">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA4YTEyIDEyIDAgMSAxIDAgMjQgMTIgMTIgMCAwIDEgMC0yNHptMCA0YTggOCAwIDEgMCAwIDE2IDggOCAwIDAgMCAwLTE2eiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=')] bg-repeat opacity-20" />
                        <div
                            className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA4YTEyIDEyIDAgMSAxIDAgMjQgMTIgMTIgMCAwIDEgMC0yNHptMCA0YTggOCAwIDEgMCAwIDE2IDggOCAwIDAgMCAwLTE2eiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=')] bg-repeat opacity-20"
                            style={{ transform: 'translate(30px, 30px)' }}
                        />
                    </div>

                    <div className="relative z-10 max-w-screen-lg">
                        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            The Ultimate API Platform for VTU Apps
                        </h1>

                        <div className="flex w-full justify-center">
                            <p className="mb-8 max-w-2xl text-center text-lg text-gray-200 sm:text-xl">
                                Build, scale, and manage your VTU business with our robust and secure API services for data, airtime, cable TV, and
                                more.
                            </p>
                        </div>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link href="/register">
                                <Button size="lg" className="bg-white text-zinc-800 hover:bg-gray-100">
                                    Get API Access <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>

                            <Link href="/register">
                                <Button size="lg" variant="outline" className="border-white bg-black text-white hover:bg-white/10">
                                    View Documentation
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
                    <h2 className="mb-12 text-center text-3xl font-bold">Why Choose Our API Platform</h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        <Card className="bg-accent/50">
                            <CardHeader>
                                <div className="text-muted-foreground flex w-full items-center justify-center">
                                    <Zap className="text-theme-1 mr-2 h-16 w-16" />
                                    <CardTitle>Lightning Fast APIs</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-center">
                                    High-performance API endpoints with instant responses and real-time transaction updates for your VTU app.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-accent/50">
                            <CardHeader>
                                <div className="text-muted-foreground flex w-full items-center justify-center">
                                    <Shield className="text-theme-1 mr-2 h-16 w-16" />
                                    <CardTitle>Enterprise Security</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Your API integrations and customer data are protected with bank-grade security and encryption.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-accent/50">
                            <CardHeader>
                                <div className="text-muted-foreground flex w-full items-center justify-center">
                                    <Clock className="text-theme-1 mr-2 h-16 w-16" />
                                    <CardTitle>99.9% Uptime</CardTitle>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <p className="text-muted-foreground">Reliable API services with guaranteed uptime and 24/7 developer support.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-gradient-to-br from-zinc-50 to-gray-100 py-20">
                <div className="container mx-auto px-4">
                    <h2 className="mb-3 text-center text-3xl font-bold">What Our Developers Say</h2>
                    <p className="mx-auto mb-12 max-w-2xl text-center text-gray-600">
                        Don't just take our word for it. See what our satisfied developers have to say about integrating with our VTU API platform.
                    </p>

                    <div className="grid gap-8 md:grid-cols-3">
                        {/* Testimonial 1 */}
                        <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg">
                            <div className="p-6">
                                <div className="mb-4 flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="h-5 w-5 fill-current text-yellow-400" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="mb-4 text-gray-600 italic">
                                    "VTU App's API has completely transformed our VTU app. The integration was seamless and the response times are
                                    incredible. Our customers love the reliability of our data and airtime services!"
                                </p>
                                <div className="flex items-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 font-bold text-white">
                                        SO
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-sm font-semibold">Sarah Okafor</h4>
                                        <p className="text-xs text-gray-500">VTU App Founder</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg">
                            <div className="p-6">
                                <div className="mb-4 flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="h-5 w-5 fill-current text-yellow-400" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="mb-4 text-gray-600 italic">
                                    "The API documentation is excellent and the webhook system works flawlessly. Integration took less than a day and
                                    we've had zero downtime since launch. Best VTU API provider out there!"
                                </p>
                                <div className="flex items-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 font-bold text-white">
                                        TJ
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-sm font-semibold">Taiwo Johnson</h4>
                                        <p className="text-xs text-gray-500">Lead Developer</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg">
                            <div className="p-6">
                                <div className="mb-4 flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="h-5 w-5 fill-current text-yellow-400" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="mb-4 text-gray-600 italic">
                                    "VTU App's API powers our entire fintech platform. The transaction success rates are outstanding and the real-time
                                    reporting helps us serve our customers better. Highly recommended!"
                                </p>
                                <div className="flex items-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 font-bold text-white">
                                        CN
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-sm font-semibold">Chioma Nnamdi</h4>
                                        <p className="text-xs text-gray-500">CTO, FinTech Startup</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-16 text-center">
                        <h3 className="mb-4 text-xl font-semibold">Ready to experience the difference?</h3>
                        <Link href="/register">
                            <Button size="lg" className="bg-zinc-800 text-white hover:bg-zinc-700">
                                Join Thousands of Happy Customers
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="bg-zinc-800 py-12 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">About Us</h3>
                            <p className="text-gray-300">
                                Powering easy and reliable payments for data, airtime, and utility bills. Built for simplicity, made for everyone.
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
                                    <a href="#" className="text-gray-300 hover:text-white">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-300 hover:text-white">
                                        Pricing
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
                            <ul className="space-y-2">
                                <li className="text-gray-300">info@vtuapp.com.ng</li>
                                <li className="text-gray-300">+2348084662186</li>
                                <li className="text-gray-300">Address: Festac Access Road, Amuwo-Odofin, Lagos, Nigeria</li>
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
