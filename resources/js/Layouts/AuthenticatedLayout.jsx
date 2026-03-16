import AppLayout from '@/layouts/app-layout';

export default function AuthenticatedLayout({ children, header, ...props }) {
    return (
        <AppLayout {...props}>
            {header && <div className="px-4 py-6">{header}</div>}
            {children}
        </AppLayout>
    );
}
