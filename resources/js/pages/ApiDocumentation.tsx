import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Copy } from 'lucide-react';
import React from 'react';
import { toast } from 'react-hot-toast';

interface Network {
    id: number;
    name: string;
    api_id: string;
}

interface DataPlan {
    id: number;
    name: string;
    size: string;
    volume: string;
    validity: number;
    price: number;
    telco_price: number;
    api_id: string;
    status: string;
    category: {
        name: string;
        type: string;
        network: Network;
    };
}

interface ApiDocumentationProps {
    networks: Network[];
    sampleDataPlans: DataPlan[];
}

const ApiDocumentation = ({ networks, sampleDataPlans }: ApiDocumentationProps) => {
    const [copiedEndpoint, setCopiedEndpoint] = React.useState<string | null>(null);
    const [copiedPayload, setCopiedPayload] = React.useState<string | null>(null);

    const copyToClipboard = async (text: string, type: 'endpoint' | 'payload') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'endpoint') {
                setCopiedEndpoint(text);
                setTimeout(() => setCopiedEndpoint(null), 2000);
            } else {
                setCopiedPayload(text);
                setTimeout(() => setCopiedPayload(null), 2000);
            }
            toast.success('Copied to clipboard!');
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    };

    const dataEndpoint = 'https://vtuapp.com.ng/api/data/';
    const topupEndpoint = 'https://vtuapp.com.ng/api/topup/';

    const dataPayload = {
        network: 1,
        mobile_number: '09095263835',
        plan: 1,
        Ported_number: true,
    };

    const topupPayload = {
        network: 1,
        amount: 500,
        mobile_number: '09095263835',
        Ported_number: true,
        airtime_type: 'VTU',
    };

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8">
                <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
                    API Documentation
                </h1>
                <p className="text-muted-foreground text-lg">
                    Integrate VTU App's data and airtime services into your applications with our RESTful API.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Authentication Section */}
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                Authentication
                            </Badge>
                            API Key Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            All API requests require authentication using your API key. Include it in the Authorization header:
                        </p>
                        <div className="rounded-lg border border-blue-200 bg-blue-100 p-4 font-mono text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            Authorization: "Bearer" or "Token" YOUR_API_KEY
                        </div>
                    </CardContent>

                    <CardContent>
                        <p className="text-muted-foreground mb-4">Base URL</p>
                        <div className="rounded-lg border border-blue-200 bg-blue-100 p-4 font-mono text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                            https://api.vtuapp.com.ng
                        </div>
                    </CardContent>
                </Card>

                {/* Network Information */}
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
                    <CardHeader>
                        <CardTitle className="text-green-700 dark:text-green-300">Network IDs</CardTitle>
                        <CardDescription className="text-green-600 dark:text-green-400">Use these network IDs in your API requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {networks.map((network) => (
                                <div
                                    key={network.id}
                                    className="rounded-lg border border-green-200 bg-green-50 p-4 transition-shadow hover:shadow-md dark:border-green-800 dark:bg-green-900/30"
                                >
                                    <div className="font-semibold text-green-800 dark:text-green-200">{network.name}</div>
                                    <div className="text-sm text-green-600 dark:text-green-400">ID: {network.id}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* API Endpoints */}
                <Tabs defaultValue="data" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                        <TabsTrigger
                            value="data"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                        >
                            Data Purchase
                        </TabsTrigger>
                        <TabsTrigger
                            value="airtime"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                        >
                            Airtime Purchase
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="data" className="space-y-6">
                        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-violet-950/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                    <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                                        POST
                                    </Badge>
                                    Data Purchase Endpoint
                                </CardTitle>
                                <CardDescription className="text-purple-600 dark:text-purple-400">
                                    Purchase data bundles for any Nigerian mobile number
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Endpoint URL */}
                                <div>
                                    <h4 className="mb-2 font-semibold">Endpoint</h4>
                                    <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-100 p-3 dark:border-purple-800 dark:bg-purple-900/30">
                                        <code className="flex-1 font-mono text-sm text-purple-800 dark:text-purple-200">{dataEndpoint}</code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                                            onClick={() => copyToClipboard(dataEndpoint, 'endpoint')}
                                        >
                                            {copiedEndpoint === dataEndpoint ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Request Payload */}
                                <div>
                                    <h4 className="mb-2 font-semibold">Request Payload</h4>
                                    <div className="rounded-lg border border-purple-200 bg-purple-100 p-4 dark:border-purple-800 dark:bg-purple-900/30">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">JSON</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                                                onClick={() => copyToClipboard(JSON.stringify(dataPayload, null, 2), 'payload')}
                                            >
                                                {copiedPayload === JSON.stringify(dataPayload, null, 2) ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <pre className="overflow-x-auto text-sm text-purple-800 dark:text-purple-200">
                                            {JSON.stringify(dataPayload, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                {/* Parameters */}
                                <div>
                                    <h4 className="mb-2 font-semibold">Parameters</h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                            <div>
                                                <span className="font-medium">network</span>
                                                <div className="text-muted-foreground">Network ID (1-4)</div>
                                            </div>
                                            <div>
                                                <span className="font-medium">mobile_number</span>
                                                <div className="text-muted-foreground">Phone number (10-13 digits)</div>
                                            </div>
                                            <div>
                                                <span className="font-medium">plan</span>
                                                <div className="text-muted-foreground">Data plan ID</div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium">Ported_number</span>
                                            <div className="text-muted-foreground">Boolean (true/false) - indicates if number is ported</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sample Response */}
                                <div>
                                    <h4 className="mb-2 font-semibold">Sample Response</h4>
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-4 dark:border-emerald-800 dark:bg-emerald-900/30">
                                        <pre className="overflow-x-auto text-sm text-emerald-800 dark:text-emerald-200">
                                            {`{
  "id": 123,
  "ident": "REF123456789",
  "amount": "100.00",
  "api_response": "Transaction successful",
  "description": "Data purchase for 09095263835",
  "plan_network": "MTN",
  "Status": "successful",
  "date": "15/01/2024 10:30 AM"
}`}
                                        </pre>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="airtime" className="space-y-6">
                        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-800 dark:from-orange-950/20 dark:to-amber-950/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                    <Badge variant="default" className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                                        POST
                                    </Badge>
                                    Airtime Purchase Endpoint
                                </CardTitle>
                                <CardDescription className="text-orange-600 dark:text-orange-400">
                                    Purchase airtime for any Nigerian mobile number
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Endpoint URL */}
                                <div>
                                    <h4 className="mb-2 font-semibold">Endpoint</h4>
                                    <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-100 p-3 dark:border-orange-800 dark:bg-orange-900/30">
                                        <code className="flex-1 font-mono text-sm text-orange-800 dark:text-orange-200">{topupEndpoint}</code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                                            onClick={() => copyToClipboard(topupEndpoint, 'endpoint')}
                                        >
                                            {copiedEndpoint === topupEndpoint ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Request Payload */}
                                <div>
                                    <h4 className="mb-2 font-semibold">Request Payload</h4>
                                    <div className="rounded-lg border border-orange-200 bg-orange-100 p-4 dark:border-orange-800 dark:bg-orange-900/30">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">JSON</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                                                onClick={() => copyToClipboard(JSON.stringify(topupPayload, null, 2), 'payload')}
                                            >
                                                {copiedPayload === JSON.stringify(topupPayload, null, 2) ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <pre className="overflow-x-auto text-sm text-orange-800 dark:text-orange-200">
                                            {JSON.stringify(topupPayload, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                {/* Parameters */}
                                <div>
                                    <h4 className="mb-2 font-semibold">Parameters</h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                            <div>
                                                <span className="font-medium">network</span>
                                                <div className="text-muted-foreground">Network ID (1-4)</div>
                                            </div>
                                            <div>
                                                <span className="font-medium">amount</span>
                                                <div className="text-muted-foreground">Airtime amount in Naira</div>
                                            </div>
                                            <div>
                                                <span className="font-medium">mobile_number</span>
                                                <div className="text-muted-foreground">Phone number (10-13 digits)</div>
                                            </div>
                                            <div>
                                                <span className="font-medium">airtime_type</span>
                                                <div className="text-muted-foreground">Type of airtime (VTU)</div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium">Ported_number</span>
                                            <div className="text-muted-foreground">Boolean (true/false) - indicates if number is ported</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sample Response */}
                                <div>
                                    <h4 className="mb-2 font-semibold">Sample Response</h4>
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-100 p-4 dark:border-emerald-800 dark:bg-emerald-900/30">
                                        <pre className="overflow-x-auto text-sm text-emerald-800 dark:text-emerald-200">
                                            {`{
  "id": 124,
  "ident": "REF987654321",
  "amount": "500.00",
  "api_response": "Airtime purchase successful",
  "description": "Airtime purchase for 09095263835",
  "plan_network": "MTN",
  "Status": "successful",
  "date": "15/01/2024 10:30 AM"
}`}
                                        </pre>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Sample Data Plans */}
                <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 dark:border-indigo-800 dark:from-indigo-950/20 dark:to-blue-950/20">
                    <CardHeader>
                        <CardTitle className="text-indigo-700 dark:text-indigo-300">Sample Data Plans</CardTitle>
                        <CardDescription className="text-indigo-600 dark:text-indigo-400">
                            Available data plans you can use with the API
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {sampleDataPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 transition-shadow hover:shadow-md dark:border-indigo-800 dark:bg-indigo-900/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-indigo-800 dark:text-indigo-200">{plan.name}</h4>
                                            <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                                {plan.size} {plan.volume} • {plan.validity} day{plan.validity > 1 ? 's' : ''} validity
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-indigo-800 dark:text-indigo-200">₦{plan.price}</div>
                                            <div className="text-sm text-indigo-600 dark:text-indigo-400">Plan ID: {plan.id}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Error Codes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Error Codes</CardTitle>
                        <CardDescription>Common error responses and their meanings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                                <div>
                                    <span className="font-medium text-red-600">400</span>
                                    <div className="text-muted-foreground">Bad Request - Invalid parameters</div>
                                </div>
                                <div>
                                    <span className="font-medium text-red-600">401</span>
                                    <div className="text-muted-foreground">Unauthorized - Invalid API key</div>
                                </div>
                                <div>
                                    <span className="font-medium text-red-600">403</span>
                                    <div className="text-muted-foreground">Forbidden - Insufficient balance</div>
                                </div>
                                <div>
                                    <span className="font-medium text-red-600">404</span>
                                    <div className="text-muted-foreground">Not Found - Plan or network not found</div>
                                </div>
                                <div>
                                    <span className="font-medium text-red-600">422</span>
                                    <div className="text-muted-foreground">Validation Error - Invalid phone number</div>
                                </div>
                                <div>
                                    <span className="font-medium text-red-600">500</span>
                                    <div className="text-muted-foreground">Server Error - Internal error</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Getting Started */}
                <Card>
                    <CardHeader>
                        <CardTitle>Getting Started</CardTitle>
                        <CardDescription>Quick steps to integrate our API</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-semibold">Get Your API Key</h4>
                                    <p className="text-muted-foreground">Generate an API key from your dashboard settings</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-semibold">Fund Your Wallet</h4>
                                    <p className="text-muted-foreground">Ensure your wallet has sufficient balance for transactions</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-semibold">Make API Calls</h4>
                                    <p className="text-muted-foreground">Use the endpoints above with your API key to purchase data or airtime</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ApiDocumentation;
