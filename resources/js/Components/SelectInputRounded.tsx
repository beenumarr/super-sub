import type { SelectHTMLAttributes } from 'react';

interface SelectInputRoundedProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: boolean;
}

export default function SelectInputRounded({
    label,
    id,
    error = false,
    className,
    children,
    ...props
}: SelectInputRoundedProps) {
    return (
        <div className="flex flex-col gap-2">
            {label ? (
                <label htmlFor={id} className="text-sm font-medium text-foreground">
                    {label}
                </label>
            ) : null}
            <select
                id={id}
                className={[
                    'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    error ? 'border-destructive focus-visible:ring-destructive' : '',
                    className ?? '',
                ]
                    .filter(Boolean)
                    .join(' ')}
                {...props}
            >
                {children}
            </select>
        </div>
    );
}
