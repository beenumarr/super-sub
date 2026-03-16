import { Button } from '@/components/ui/button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface NormalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    processing?: boolean;
    children: ReactNode;
}

export default function NormalButton({
    processing = false,
    disabled,
    children,
    ...props
}: NormalButtonProps) {
    return (
        <Button disabled={processing || disabled} {...props}>
            {children}
        </Button>
    );
}
