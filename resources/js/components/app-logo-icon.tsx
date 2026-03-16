import { branding } from '@/config/branding';

export default function AppLogoIcon() {
    return <img src={branding.logos.app} alt={branding.appName} className="h-10" />;
}
