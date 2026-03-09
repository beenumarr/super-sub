import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfigItemProps {
    name: string;
    label: string;
    value: string | number | undefined;
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ConfigItem({ name, label, value, handleOnChange }: ConfigItemProps) {
    return (
        <div className="w-full space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                type="text"
                name={name}
                value={value ?? ''}
                onChange={handleOnChange}
            />
        </div>
    );
}
