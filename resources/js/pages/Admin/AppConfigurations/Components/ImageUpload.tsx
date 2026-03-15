import { Button } from '@/components/ui/button';
import { Camera, Trash2 } from 'lucide-react';
import Compressor from 'compressorjs';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
    images: Blob[];
    previews: string[];
    setPreviews: React.Dispatch<React.SetStateAction<string[]>>;
    setImages: React.Dispatch<React.SetStateAction<Blob[]>>;
    multiple?: boolean;
}

function formatSize(size: number): string {
    if (size > 1048576) return Math.round(size / 1048576) + 'mb';
    if (size > 1024) return Math.round(size / 1024) + 'kb';
    return size + 'b';
}

function PreviewItem({
    src,
    alt,
    size,
    onRemove,
}: {
    src: string;
    alt: string;
    size: number;
    onRemove: () => void;
}) {
    return (
        <li className="block h-40 w-full p-1">
            <article className="group relative flex h-full w-full cursor-pointer rounded-md bg-gray-100 shadow-sm outline-none focus:shadow-outline">
                <img
                    src={src}
                    alt={alt}
                    className="h-full w-full rounded-md object-cover"
                />
                <section className="absolute top-0 z-20 flex h-full w-full flex-col rounded-md px-3 py-2">
                    <div className="mt-auto flex items-center gap-2">
                        <span className="text-xs text-gray-700">{formatSize(size)}</span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="ml-auto h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={onRemove}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </section>
            </article>
        </li>
    );
}

export default function ImageUpload({
    images,
    previews,
    setPreviews,
    setImages,
    multiple = false,
}: ImageUploadProps) {
    const [processing, setProcessing] = useState(false);

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            new Compressor(file, {
                quality: 0.9,
                maxWidth: 800,
                maxHeight: 800,
                success(result) {
                    resolve(result);
                },
                error(err) {
                    reject(err);
                },
            });
        });
    };

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setProcessing(true);
        const files = event.target.files;
        if (!files?.length) {
            setProcessing(false);
            return;
        }
        const newImages: Blob[] = [];
        const newPreviews: string[] = [];
        const count = multiple ? Math.min(4, files.length) : 1;

        for (let i = 0; i < count; i++) {
            const file = files[i];
            if (!file) continue;
            if (file.type.startsWith('image/') && file.size <= 20000000) {
                try {
                    const compressed = await compressImage(file);
                    newImages.push(compressed);
                    newPreviews.push(URL.createObjectURL(compressed));
                } catch {
                    toast.error('Failed to compress image');
                }
            } else {
                toast.error('Invalid file or file too large (max 20MB)');
            }
        }

        setImages((prev) => [...prev, ...newImages]);
        setPreviews((prev) => [...prev, ...newPreviews]);
        setProcessing(false);
        event.target.value = '';
    };

    const handleRemove = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => {
            const next = [...prev];
            URL.revokeObjectURL(next[index]);
            return next.filter((_, i) => i !== index);
        });
    };

    return (
        <div className="my-3 flex w-full flex-col items-center justify-center">
            {(previews.length === 0 || multiple) && (
                <label className="mt-5 flex w-full cursor-pointer items-center justify-center rounded-md border border-theme-2 px-4 py-3 tracking-wide shadow-sm hover:font-medium text-theme-2">
                    <Camera className="h-5 w-5" />
                    <span className="ml-2 text-base leading-normal">
                        {multiple ? 'Select Images' : 'Select a Photo'}
                    </span>
                    <input
                        type="file"
                        onChange={handleChange}
                        className="hidden"
                        accept="image/*"
                        multiple={multiple}
                    />
                </label>
            )}
            <div className="mt-2 w-full">
                {processing && (
                    <div className="flex w-full justify-center p-5">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-1 border-t-transparent" />
                        <span className="ml-2">Processing Images...</span>
                    </div>
                )}
                {previews.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 rounded-md border-2 border-dashed border-gray-400 py-3 sm:grid-cols-2">
                        {previews.map((preview, index) => (
                            <PreviewItem
                                key={index}
                                src={preview}
                                alt="Preview"
                                size={images[index]?.size ?? 0}
                                onRemove={() => handleRemove(index)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
