import { ColorInput } from '@/components/ui/color-input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ConfigItem } from '../ConfigItem';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

interface SiteImages {
    bg_0?: string;
    logo?: string;
}

interface GeneralSettingsProps {
    data: Record<string, unknown>;
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setData: (keyOrData: string | Record<string, unknown>, value?: unknown) => void;
    setFormModal: (value: boolean) => void;
    setFormModal2: (value: boolean) => void;
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

export default function GeneralSettings({
    data,
    handleOnChange,
    setData,
    setFormModal,
    setFormModal2,
    site_images,
    processing2,
    setProcessing2,
}: GeneralSettingsProps) {
    const primaryRaw = data['site_primary_color'] as string | undefined;
    const secondaryRaw = data['site_secondary_color'] as string | undefined;

    const isHexColor = (value?: string) =>
        typeof value === 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

    const normalizedPrimary = isHexColor(primaryRaw) ? primaryRaw : '#3b82f6';
    const normalizedSecondary = isHexColor(secondaryRaw) ? secondaryRaw : '#8b5cf6';

    useEffect(() => {
        if (primaryRaw !== normalizedPrimary) {
            setData('site_primary_color', normalizedPrimary);
        }
        if (secondaryRaw !== normalizedSecondary) {
            setData('site_secondary_color', normalizedSecondary);
        }
    }, [primaryRaw, normalizedPrimary, secondaryRaw, normalizedSecondary, setData]);

    return (
        <div className="space-y-6">
            <ConfigItem
                label="Site Name"
                name="site_name"
                value={data['site_name'] as string}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />
            <ConfigItem
                label="Welcome Notification"
                name="site_notification"
                value={data['site_notification'] as string}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />
            <ConfigItem
                label="Hero Title"
                name="site_hero_title"
                value={data['site_hero_title'] as string}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />
            <ColorInput
                label="Hero Title Color"
                value={(data['site_hero_title_color'] as string) ?? ''}
                onValueChange={(value) => setData('site_hero_title_color', value)}
            />
            <ConfigItem
                label="Hero Subtitle"
                name="site_hero_subtitle"
                value={data['site_hero_subtitle'] as string}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />
            <div className="space-y-2">
                <Label htmlFor="site_about">About us</Label>
                <Textarea
                    id="site_about"
                    name="site_about"
                    rows={8}
                    value={(data['site_about'] as string) ?? ''}
                    onChange={handleOnChange}
                    className="min-h-32"
                />
            </div>
            <ConfigItem
                label="Contact Address"
                name="site_contact_address"
                value={data['site_contact_address'] as string}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />
            <ConfigItem
                label="Contact Email"
                name="site_contact_email"
                value={data['site_contact_email'] as string}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />
            <ConfigItem
                label="Contact Phone Number (Please Enter with country code +234)"
                name="site_contact_number"
                value={data['site_contact_number'] as string}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />
            <ConfigItem
                label="Play Store Link"
                name="playstore_link"
                value={data['playstore_link'] as string}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />
            <ConfigItem
                label="App Store Link"
                name="appstore_link"
                value={data['appstore_link'] as string}
                handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            />
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
            <p className="text-xs text-muted-foreground mb-3">These colors will be applied throughout the entire site.</p>

            {/* Color Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/30">
                <div>
                    <p className="text-sm font-medium mb-2">Primary Color Preview</p>
                    <div
                        className="h-24 rounded-lg border-2 flex items-center justify-center text-white font-medium"
                        style={{
                            backgroundColor: normalizedPrimary,
                        }}
                    >
                        {normalizedPrimary}
                    </div>
                </div>
                <div>
                    <p className="text-sm font-medium mb-2">Secondary Color Preview</p>
                    <div
                        className="h-24 rounded-lg border-2 flex items-center justify-center text-white font-medium"
                        style={{
                            backgroundColor: normalizedSecondary,
                        }}
                    >
                        {normalizedSecondary}
                    </div>
                </div>
            </div>

            <div className="pt-3">
                <div className="rounded-t-md bg-muted px-4 py-2">
                    <h3 className="text-lg font-medium">Website Background Images</h3>
                </div>
                <div className="flex flex-wrap gap-4 rounded-b-md border border-t-0 p-4">
                    <div className="rounded-md border-2 p-3 text-center">
                        {site_images?.bg_0 ? (
                            <img
                                src={`${site_images.bg_0}?v=${Date.now()}`}
                                className="h-40 w-64 rounded-md border object-cover"
                                alt="Background"
                            />
                        ) : (
                            <div className="flex h-40 w-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                                No background image uploaded
                            </div>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={() => setFormModal(true)}
                        >
                            Change background
                        </Button>
                    </div>
                    <div className="rounded-md border-2 p-3 text-center">
                        {site_images?.logo ? (
                            <img
                                src={`${site_images.logo}?v=${Date.now()}`}
                                className="h-40 w-64 rounded-md border object-cover"
                                alt="Site Logo"
                            />
                        ) : (
                            <div className="flex h-40 w-64 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                                No logo uploaded
                            </div>
                        )}
                        <div className="mt-2 space-y-2">
                            <Select
                                value={(data['logo_type'] as string) || 'none'}
                                onValueChange={(v) => setData('logo_type', v === 'none' ? '' : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Logo Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Select Logo Type</SelectItem>
                                    <SelectItem value="icon">Icon Only</SelectItem>
                                    <SelectItem value="titled">Titled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-2 w-full"
                                onClick={() => setFormModal2(true)}
                            >
                                Change site logo
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    {!processing2 ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => clearImages(setProcessing2)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear photos
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-theme-1 border-t-transparent" />
                            <span className="text-sm">Clearing...</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-3">
                <div className="rounded-t-md bg-muted px-4 py-2">
                    <h3 className="text-lg font-medium">User Registration and Login</h3>
                </div>
                <div className="space-y-4 rounded-b-md border border-t-0 p-4">
                    <div className="flex items-center justify-between">
                        <span>Registration</span>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={Boolean(data['enable_user_registration'])}
                                onCheckedChange={(checked) =>
                                    setData('enable_user_registration', checked)
                                }
                            />
                            <span className="text-sm text-muted-foreground">
                                {data['enable_user_registration'] ? 'Enable' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Login</span>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={Boolean(data['enable_user_login'])}
                                onCheckedChange={(checked) => setData('enable_user_login', checked)}
                            />
                            <span className="text-sm text-muted-foreground">
                                {data['enable_user_login'] ? 'Enable' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
