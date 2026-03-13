import { Input } from '@/components/ui/input';
import type { InputHTMLAttributes } from 'react';

interface TextInputRoundedProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: boolean;
    placeHolder?: string;
}

export default function TextInputRounded({
    label,
    id,
    error = false,
    className,
    placeHolder,
    ...props
}: TextInputRoundedProps) {
    return (
        <div className="flex flex-col gap-2">
            {label ? (
                <label htmlFor={id} className="text-sm font-medium text-foreground">
                    {label}
                </label>
            ) : null}
            <Input
                id={id}
                placeholder={placeHolder}
                className={[
                    'rounded-md',
                    error ? 'border-destructive focus-visible:ring-destructive' : '',
                    className ?? '',
                ]
                    .filter(Boolean)
                    .join(' ')}
                {...props}
            />
        </div>
    );
}
