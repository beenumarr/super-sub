import { Button } from '@/components/ui/button';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';

interface SiteLogoFormFieldProps {
    handleClose: () => void;
    reloadPage: () => void;
}

export default function SiteLogoFormField({ handleClose, reloadPage }: SiteLogoFormFieldProps) {
    const [images, setImages] = useState<Blob[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);
    const { flash } = usePage().props as any;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0) {
            toast.error('Please select a photo');
            return;
        }

        setProcessing(true);
        const formData = new FormData();
        images.forEach((img) => formData.append('images[]', img));
        formData.append('name', 'logo');

        router.post(route('update-site-images'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Logo uploaded successfully! Processing...');
                handleClose();
                // Wait a moment for the job to process, then reload
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            },
            onError: (errors: any) => {
                console.error('Upload error:', errors);
                // Handle validation errors
                Object.entries(errors).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach((err) => toast.error(String(err)));
                    } else {
                        toast.error(String(value));
                    }
                });
                setProcessing(false);
            },
        });
    };

    return (
        <form onSubmit={submit} className="flex w-full flex-col justify-center p-3">
            <span className="m-4 text-center text-lg font-medium text-muted-foreground">
                Please Select Photo
            </span>
            <p className="mb-3 text-center text-xs text-muted-foreground">
                Recommended logo: square PNG (512×512 or 1024×1024). Use transparent background for best results.
            </p>
            <ImageUpload
                images={images}
                setImages={setImages}
                previews={previews}
                setPreviews={setPreviews}
                multiple={false}
            />
            <div className="mt-4 flex items-center justify-end">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Uploading...' : 'Update'}
                </Button>
            </div>
        </form>
    );
}
