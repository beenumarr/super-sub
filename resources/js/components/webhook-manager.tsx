import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function WebhookManager({ existingWebhookUrl }: { existingWebhookUrl?: string | null }) {
    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        webhook_url: existingWebhookUrl || '',
    });

    const submitForm: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('developer.webhook.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Optional: Add success notification
            },
        });
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="Webhook URL" description="Configure your webhook endpoint to receive real-time event notifications." />

            <div className="space-y-4">
                <div>
                    <h3 className="mb-2 text-sm font-medium">Events</h3>
                    <p className="text-muted-foreground mb-3 text-sm">Your webhook will receive notifications for the following events:</p>
                    <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                        <li>Transaction successful</li>
                        <li>Transaction failed</li>
                        <li>Balance updates</li>
                    </ul>
                </div>

                <form onSubmit={submitForm} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhook_url">Webhook URL</Label>
                        <Input
                            id="webhook_url"
                            type="url"
                            placeholder="https://yourapp.com/webhook"
                            value={data.webhook_url}
                            onChange={(e) => setData('webhook_url', e.target.value)}
                            className="max-w-xl"
                        />
                        <p className="text-muted-foreground text-xs">
                            Enter the URL where you want to receive webhook events. Must be a valid HTTPS URL.
                        </p>
                        <InputError message={errors.webhook_url} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing} className="bg-theme-1 hover:bg-theme-1/90">
                            {processing ? 'Saving...' : 'Save Webhook URL'}
                        </Button>

                        {recentlySuccessful && <p className="text-sm text-green-600 dark:text-green-400">Saved successfully!</p>}
                    </div>
                </form>

                {existingWebhookUrl && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/30">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Current Webhook URL</p>
                        <p className="mt-1 font-mono text-sm break-all text-blue-800 dark:text-blue-200">{existingWebhookUrl}</p>
                    </div>
                )}

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Security Note</p>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                        Ensure your webhook endpoint validates the signature of incoming requests to verify they originate from our system.
                    </p>
                </div>

                <div className="rounded-lg border p-4">
                    <p className="mb-2 text-sm font-medium">Webhook Payload Format</p>
                    <p className="text-muted-foreground mb-3 text-xs">Your endpoint will receive a POST request with the following JSON payload:</p>
                    <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                        {`{
  "network": "MTN",
  "data_type": "DATA SHARE",
  "purchased_plan": "1.0GB",
  "plan_amount": "170.0",
  "ident": "Data9ee87h387-240b-",
  "mobile_number": "0903****",
  "Status": "successful",
  "transaction_status": "successful",
  "api_response": "Transaction completed",
  "transaction_date": "27, Jun 2024"
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
