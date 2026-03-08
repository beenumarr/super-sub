import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Link } from '@inertiajs/react';

export default function ApiKeyManager({ existingApiKey }: { existingApiKey?: string }) {
    const { post, processing, errors, reset } = useForm();
    const [agreed, setAgreed] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const submitForm: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('developer.generate-key'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setModalOpen(false);
            },
        });
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="API Key" description="Manage your API key for third-party access." />

            <div>
                <p className="text-muted-foreground mb-4">Base URL</p>
                <div className="rounded-lg border border-blue-200 bg-blue-100 p-4 font-mono text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    https://api.vtuapp.com.ng
                </div>
            </div>

            {existingApiKey ? (
                <div className="bg-accent/40 rounded-lg border p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <span className="break-all">{existingApiKey}</span>
                            <button
                                type="button"
                                className="ml-2 rounded p-1 transition hover:bg-gray-200 dark:hover:bg-gray-700"
                                title="Copy API Key"
                                onClick={() => {
                                    navigator.clipboard.writeText(existingApiKey);
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
                                    <rect x="3" y="3" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
                                </svg>
                            </button>
                        </div>
                    </p>
                </div>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">You have not generated an API key yet.</p>
            )}

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="default" className="bg-theme-1 hover:bg-theme-1/90 cursor-pointer text-white">
                        Generate New API Key
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Generate New API Key</DialogTitle>
                    <DialogDescription>
                        By generating a new key, the existing one (if any) will be revoked. Ensure you’ve read and accepted our terms and conditions.
                    </DialogDescription>
                    <form className="space-y-4" onSubmit={submitForm}>
                        <div className="flex items-start gap-2">
                            <Checkbox id="agree" checked={agreed} onCheckedChange={setAgreed} />
                            <Label htmlFor="agree" className="text-sm">
                                I agree to the{' '}
                                <Link href="/terms" target="_blank" className="text-primary underline">
                                    Terms and Conditions
                                </Link>
                            </Label>
                        </div>
                        <InputError message={errors.agree} />
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button variant="secondary" type="button">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={!agreed || processing}>
                                Confirm & Generate
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
