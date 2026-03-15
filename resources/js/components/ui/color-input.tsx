import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ColorInputProps {
    value?: string;
    onValueChange: (value: string) => void;
    label?: string;
    className?: string;
}

export function ColorInput({ value = '#000000', onValueChange, label, className }: ColorInputProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {label && <Label>{label}</Label>}
            <div className="flex items-center gap-3">
                <Input
                    type="color"
                    value={value || '#000000'}
                    onChange={(e) => onValueChange(e.target.value)}
                    className="h-10 w-14 cursor-pointer border-0 p-1"
                />
                <Input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onValueChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 font-mono text-sm"
                />
            </div>
        </div>
    );
}
