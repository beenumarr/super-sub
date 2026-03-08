import { router, useForm } from '@inertiajs/react';
import { toast } from 'react-hot-toast';

export interface RefreshProgress {
    status: 'starting' | 'processing' | 'completed' | 'failed';
    total: number;
    processed: number;
    successful: number;
    failed: number;
    error?: string;
}

export interface LoadDataProgress {
    status: 'starting' | 'processing' | 'completed' | 'failed';
    total: number;
    processed: number;
    successful: number;
    failed: number;
    error?: string;
}

export interface BulkRefreshCallbacks {
    onStart: () => void;
    onSuccess: (jobId: string, phoneCount: number) => void;
    onError: (errors: Record<string, string>) => void;
    onProgressUpdate: (progress: RefreshProgress) => void;
    onProgressComplete: (progress: RefreshProgress) => void;
    onProgressError: (error: string) => void;
}

export interface BulkLoadDataCallbacks {
    onStart: () => void;
    onSuccess: (jobId: string, phoneCount: number) => void;
    onError: (errors: Record<string, string>) => void;
    onProgressUpdate: (progress: LoadDataProgress) => void;
    onProgressComplete: (progress: LoadDataProgress) => void;
    onProgressError: (error: string) => void;
}

export interface BulkRefreshOptions {
    selectedPhones: Set<number>;
    form: ReturnType<typeof useForm>;
    callbacks: BulkRefreshCallbacks;
}

export interface BulkLoadDataOptions {
    selectedPhones: Set<number>;
    planId: number;
    form: ReturnType<typeof useForm>;
    callbacks: BulkLoadDataCallbacks;
}

export const handleBulkRefreshBalance = (options: BulkRefreshOptions) => {
    const { selectedPhones, form, callbacks } = options;

    if (selectedPhones.size === 0) return;

    // Call onStart callback
    callbacks.onStart();

    // Set form data
    form.setData({
        phoneNumberIds: Array.from(selectedPhones),
        action: 'refresh_balance',
    });

    console.log('Starting batch refresh balance with:', form.data);

    // Submit using Inertia form
    form.post(route('phone-numbers.bulk-action'), {
        onSuccess: (page) => {
            console.log('Bulk refresh success:', page);

            // The job ID and results will be available in the next page load via props
            // We don't need to extract them here since the component will handle them
            toast.success(`Balance refresh started for ${selectedPhones.size} phone number(s)`);
        },
        onError: (errors: Record<string, string>) => {
            console.error('Bulk refresh error:', errors);
            toast.error('Failed to refresh balances');
            callbacks.onError(errors);
        },
    });
};

export const handleBulkLoadData = (options: BulkLoadDataOptions) => {
    const { selectedPhones, planId, form, callbacks } = options;

    if (selectedPhones.size === 0) return;

    // Call onStart callback
    callbacks.onStart();

    // Set form data
    form.setData({
        phoneNumberIds: Array.from(selectedPhones),
        action: 'load_data',
        plan_id: planId,
    });

    console.log('Starting batch load data with:', form.data);

    // Submit using Inertia form
    form.post(route('phone-numbers.bulk-action'), {
        onSuccess: (page) => {
            console.log('Bulk load data success:', page);

            // The job ID and results will be available in the next page load via props
            // We don't need to extract them here since the component will handle them
            toast.success(`Data loading started for ${selectedPhones.size} phone number(s)`);
        },
        onError: (errors: Record<string, string>) => {
            console.error('Bulk load data error:', errors);
            toast.error('Failed to start data loading');
            callbacks.onError(errors);
        },
    });
};

export const startProgressPolling = (
    jobId: string,
    callbacks: {
        onProgressUpdate: (progress: RefreshProgress) => void;
        onProgressComplete: (progress: RefreshProgress) => void;
        onProgressError: (error: string) => void;
        onCheckingProgress: (isChecking: boolean) => void;
    },
) => {
    const pollInterval = setInterval(async () => {
        try {
            callbacks.onCheckingProgress(true);
            const response = await fetch(route('phone-numbers.refresh-progress', { jobId }));
            const progress: RefreshProgress = await response.json();

            if (response.ok) {
                callbacks.onProgressUpdate(progress);

                if (progress.status === 'completed' || progress.status === 'failed') {
                    clearInterval(pollInterval);
                    callbacks.onCheckingProgress(false);

                    if (progress.status === 'completed') {
                        toast.success(`Balance refresh completed: ${progress.successful} successful, ${progress.failed} failed`);
                        callbacks.onProgressComplete(progress);
                    } else {
                        toast.error(`Balance refresh failed: ${progress.error}`);
                        callbacks.onProgressError(progress.error || 'Unknown error');
                    }

                    // Refresh the page to show updated balances
                    router.reload();
                }
            } else {
                clearInterval(pollInterval);
                callbacks.onCheckingProgress(false);
                toast.error('Failed to check refresh progress');
                callbacks.onProgressError('Failed to check refresh progress');
            }
        } catch (error) {
            console.error('Error checking progress:', error);
            clearInterval(pollInterval);
            callbacks.onCheckingProgress(false);
            callbacks.onProgressError('Error checking progress');
        }
    }, 2000); // Poll every 2 seconds

    // Clear interval after 10 minutes to prevent infinite polling
    setTimeout(() => {
        clearInterval(pollInterval);
        callbacks.onCheckingProgress(false);
    }, 600000);

    return pollInterval;
};

export const startLoadDataProgressPolling = (
    jobId: string,
    callbacks: {
        onProgressUpdate: (progress: LoadDataProgress) => void;
        onProgressComplete: (progress: LoadDataProgress) => void;
        onProgressError: (error: string) => void;
        onCheckingProgress: (isChecking: boolean) => void;
    },
) => {
    const pollInterval = setInterval(async () => {
        try {
            callbacks.onCheckingProgress(true);
            const response = await fetch(route('phone-numbers.load-data-progress', { jobId }));
            const progress: LoadDataProgress = await response.json();

            if (response.ok) {
                callbacks.onProgressUpdate(progress);

                if (progress.status === 'completed' || progress.status === 'failed') {
                    clearInterval(pollInterval);
                    callbacks.onCheckingProgress(false);

                    if (progress.status === 'completed') {
                        toast.success(`Data loading completed: ${progress.successful} successful, ${progress.failed} failed`);
                        callbacks.onProgressComplete(progress);
                    } else {
                        toast.error(`Data loading failed: ${progress.error}`);
                        callbacks.onProgressError(progress.error || 'Unknown error');
                    }

                    // Refresh the page to show updated data
                    router.reload();
                }
            } else {
                clearInterval(pollInterval);
                callbacks.onCheckingProgress(false);
                toast.error('Failed to check load data progress');
                callbacks.onProgressError('Failed to check load data progress');
            }
        } catch (error) {
            console.error('Error checking load data progress:', error);
            clearInterval(pollInterval);
            callbacks.onCheckingProgress(false);
            callbacks.onProgressError('Error checking load data progress');
        }
    }, 2000); // Poll every 2 seconds

    // Clear interval after 10 minutes to prevent infinite polling
    setTimeout(() => {
        clearInterval(pollInterval);
        callbacks.onCheckingProgress(false);
    }, 600000);

    return pollInterval;
};
