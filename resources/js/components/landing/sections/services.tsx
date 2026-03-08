import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Adjust import based on your setup
import { CreditCard, Phone, Settings, Wifi } from 'lucide-react';

export function OurServicesSection() {
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <h2 className="mb-12 text-center text-3xl font-bold">API Services</h2>
                <div className="grid gap-8 md:grid-cols-4">
                    <Card className="bg-accent/40 relative overflow-hidden">
                        <div className="from-theme-1 absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-gradient-to-br to-blue-200/20 opacity-20" />
                        <CardHeader>
                            <Phone className="mb-4 h-8 w-8 text-[#4a8980]" />
                            <CardTitle>Airtime API</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Integrate fast and reliable airtime top-up services into your VTU application.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-accent/40 relative overflow-hidden">
                        <div className="from-theme-1 absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-gradient-to-br to-blue-200/20 opacity-50" />
                        <CardHeader>
                            <Wifi className="mb-4 h-8 w-8 text-[#4a8980]" />
                            <CardTitle>Data API</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Seamless data bundle purchases with instant delivery and real-time status updates.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-accent/40 relative overflow-hidden">
                        <div className="from-theme-1 absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-gradient-to-br to-blue-200/20 opacity-20" />
                        <CardHeader>
                            <CreditCard className="mb-4 h-8 w-8 text-[#4a8980]" />
                            <CardTitle>Bill Payment API</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Comprehensive bill payment solutions for electricity, cable TV, and utility services.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-accent/40 relative overflow-hidden">
                        <div className="from-theme-1 absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-gradient-to-br to-blue-200/20 opacity-20" />
                        <CardHeader>
                            <Settings className="mb-4 h-8 w-8 text-[#4a8980]" />
                            <CardTitle>Webhook</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Real-time notifications.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
