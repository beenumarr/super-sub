import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ConfigItem } from '../ConfigItem';

interface GeneralSettingsProps {
    data: Record<string, unknown>;
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setData: (keyOrData: string | Record<string, unknown>, value?: unknown) => void;
}

export default function GeneralSettings({ data, handleOnChange, setData }: GeneralSettingsProps) {
    return (
        <div className="space-y-8">
            {/* Site Identity */}
            <section className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium">Site Identity</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">Basic information about your platform.</p>
                </div>
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
            </section>

            <div className="border-t" />

            {/* Hero Section */}
            <section className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium">Hero Section</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">Headline text shown on the landing page.</p>
                </div>
                <ConfigItem
                    label="Hero Title"
                    name="site_hero_title"
                    value={data['site_hero_title'] as string}
                    handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                />
                <ConfigItem
                    label="Hero Subtitle"
                    name="site_hero_subtitle"
                    value={data['site_hero_subtitle'] as string}
                    handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                />
            </section>

            <div className="border-t" />

            {/* About & Contact */}
            <section className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium">About & Contact</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">Company info and contact details.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="site_about">About Us</Label>
                    <Textarea
                        id="site_about"
                        name="site_about"
                        rows={6}
                        value={(data['site_about'] as string) ?? ''}
                        onChange={handleOnChange}
                        className="min-h-28"
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
                    label="Contact Phone (with country code, e.g. +234…)"
                    name="site_contact_number"
                    value={data['site_contact_number'] as string}
                    handleOnChange={handleOnChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                />
            </section>

            <div className="border-t" />

            {/* App Store Links */}
            <section className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium">App Download Links</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">Links displayed in your app's download section.</p>
                </div>
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
            </section>

            <div className="border-t" />

            {/* Access Control */}
            <section className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium">Access Control</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">Allow or restrict user registration and login.</p>
                </div>
                <div className="space-y-3">
                    {[
                        { label: 'User Registration', key: 'enable_user_registration' },
                        { label: 'User Login', key: 'enable_user_login' },
                    ].map(({ label, key }) => (
                        <div key={key} className="flex items-center justify-between py-1">
                            <span className="text-sm">{label}</span>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={Boolean(data[key])}
                                    onCheckedChange={(checked) => setData(key, checked)}
                                />
                                <span className="w-14 text-right text-xs text-muted-foreground">
                                    {data[key] ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
