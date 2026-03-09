import { ConfigItem } from '../ConfigItem';

interface EmailConfigProps {
    data: Record<string, string | number | undefined>;
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const configFields = [
    { label: 'Mail Transport', name: 'mail_transport' },
    { label: 'Mail URL', name: 'mail_url' },
    { label: 'Mail Host', name: 'mail_host' },
    { label: 'Mail Port', name: 'mail_port' },
    { label: 'Mail Encryption', name: 'mail_encryption' },
    { label: 'Mail Username', name: 'mail_username' },
    { label: 'Mail Password', name: 'mail_password' },
    { label: 'Mail Timeout', name: 'timeout' },
    { label: 'Mail EHLO Domain', name: 'local_domain' },
    { label: 'Mail From Address', name: 'mail_from_address' },
    { label: 'Mail From Name', name: 'mail_from_name' },
];

export default function EmailConfig({ data, handleOnChange }: EmailConfigProps) {
    return (
        <div className="space-y-4">
            {configFields.map((field) => (
                <ConfigItem
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={data[field.name]}
                    handleOnChange={handleOnChange}
                />
            ))}
        </div>
    );
}
