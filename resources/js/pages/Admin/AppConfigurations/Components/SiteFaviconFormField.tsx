import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ImageUpload from './ImageUpload';

interface SiteFaviconFormFieldProps {
    handleClose: () => void;
    reloadPage: () => void;
}

export default function SiteFaviconFormField({ handleClose }: SiteFaviconFormFieldProps) {
    const [images, setImages] = useState<Blob[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (images.length === 0) {
            toast.error('Please select a photo');
            return;
        }

        setProcessing(true);
        const formData = new FormData();
        images.forEach((img) => formData.append('images[]', img));
        formData.append('name', 'favicon');

        router.post(route('update-site-images'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Favicon uploaded successfully! Processing...');
                handleClose();
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            },
            onError: (errors: any) => {
                Object.entries(errors).forEach(([, value]) => {
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

