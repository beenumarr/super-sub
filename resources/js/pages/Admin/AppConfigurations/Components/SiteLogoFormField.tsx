import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
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
                toast.success('Settings Updated Successfully!');
                handleClose();
                router.reload();
            },
            onError: (errors) => {
                Object.values(errors)
                    .flat()
                    .forEach((err) => toast.error(String(err)));
            },
            onFinish: () => setProcessing(false),
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
                    Update
                </Button>
            </div>
        </form>
    );
}
