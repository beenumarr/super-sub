import { Button } from '@/components/ui/button';
import { ColorInput } from '@/components/ui/color-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface SiteImages {
    bg_0?: string;
    logo?: string;
    favicon?: string;
}

interface AppearanceSettingsProps {
    data: Record<string, unknown>;
    setData: (keyOrData: string | Record<string, unknown>, value?: unknown) => void;
    setFormModal: (value: boolean) => void;
    setFormModal2: (value: boolean) => void;
    setFaviconModal: (value: boolean) => void;
    site_images: SiteImages;
    processing2: boolean;
    setProcessing2: (value: boolean) => void;
}

function clearImages(setProcessing: (v: boolean) => void) {
    setProcessing(true);
    router.post(
        '/admin/clear-images',
        { all: true },
        {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Images cleared successfully');
                router.reload();
            },
            onError: (errors) => {
                Object.values(errors)
                    .flat()
                    .forEach((err) => toast.error(String(err)));
            },
            onFinish: () => setProcessing(false),
        },
    );
}

export default function AppearanceSettings({
    data,
    setData,
    setFormModal,
    setFormModal2,
    setFaviconModal,
    site_images,
    processing2,
    setProcessing2,
}: AppearanceSettingsProps) {
    const primaryRaw = data['site_primary_color'] as string | undefined;
    const secondaryRaw = data['site_secondary_color'] as string | undefined;

    const isHexColor = (value?: string) =>
        typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

    const normalizedPrimary = isHexColor(primaryRaw) ? primaryRaw! : '#3b82f6';
    const normalizedSecondary = isHexColor(secondaryRaw) ? secondaryRaw! : '#8b5cf6';

    useEffect(() => {
        if (primaryRaw !== normalizedPrimary) setData('site_primary_color', normalizedPrimary);
        if (secondaryRaw !== normalizedSecondary) setData('site_secondary_color', normalizedSecondary);
    }, [primaryRaw, normalizedPrimary, secondaryRaw, normalizedSecondary, setData]);

    return (
        <div className="space-y-8">
            {/* Brand Colors */}
            <section className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium">Brand Colors</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">Applied throughout the entire site.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ColorInput
                        label="Primary Color"
                        value={normalizedPrimary}
                        onValueChange={(value) => setData('site_primary_color', value)}
                    />
                    <ColorInput
                        label="Secondary Color"
                        value={normalizedSecondary}
                        onValueChange={(value) => setData('site_secondary_color', value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div
                        className="flex h-12 items-center justify-center rounded-md text-xs font-medium text-white"
                        style={{ backgroundColor: normalizedPrimary }}
                    >
                        Primary — {normalizedPrimary}
                    </div>
                    <div
                        className="flex h-12 items-center justify-center rounded-md text-xs font-medium text-white"
                        style={{ backgroundColor: normalizedSecondary }}
                    >
                        Secondary — {normalizedSecondary}
                    </div>
                </div>
            </section>

            <div className="border-t" />

            {/* Site Images */}
            <section className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium">Site Images</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">Background, logo, and favicon for your site.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Background */}
                    <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Background</p>
                        {site_images?.bg_0 ? (
                            <img
                                src={`${site_images.bg_0}?v=${Date.now()}`}
                                className="h-36 w-full rounded-md border object-cover"
                                alt="Background"
                            />
                        ) : (
                            <div className="flex h-36 w-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                                No image uploaded
                            </div>
                        )}
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setFormModal(true)}>
                            Change
                        </Button>
                    </div>

                    {/* Logo */}
                    <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Logo</p>
                        {site_images?.logo ? (
                            <img
                                src={`${site_images.logo}?v=${Date.now()}`}
                                className="h-36 w-full rounded-md border object-contain"
                                alt="Logo"
                            />
                        ) : (
                            <div className="flex h-36 w-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                                No logo uploaded
                            </div>
                        )}
                        <Select
                            value={(data['logo_type'] as string) || 'none'}
                            onValueChange={(v) => setData('logo_type', v === 'none' ? '' : v)}
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Logo display type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Display type</SelectItem>
                                <SelectItem value="icon">Icon only</SelectItem>
                                <SelectItem value="titled">Icon + Name</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setFormModal2(true)}>
                            Change
                        </Button>
                    </div>

                    {/* Favicon */}
                    <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Favicon</p>
                        {site_images?.favicon ? (
                            <img
                                src={`${site_images.favicon}?v=${Date.now()}`}
                                className="h-36 w-full rounded-md border object-contain"
                                alt="Favicon"
                            />
                        ) : (
                            <div className="flex h-36 w-full items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                                No favicon uploaded
                            </div>
                        )}
                        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setFaviconModal(true)}>
                            Change
                        </Button>
                    </div>
                </div>

                <div className="pt-1">
                    {processing2 ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Clearing…
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 px-0 text-xs"
                            onClick={() => clearImages(setProcessing2)}
                        >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Clear all images
                        </Button>
                    )}
                </div>
            </section>
        </div>
    );
}
