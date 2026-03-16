import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ReactNode } from 'react';

interface ModalProps {
    title?: string;
    show: boolean;
    handleClose: () => void;
    children: ReactNode;
    className?: string;
}

export default function Modal({ title, show, handleClose, children, className }: ModalProps) {
    return (
        <Dialog open={show} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className={className ?? 'max-h-[90vh] overflow-y-auto sm:max-w-2xl'}>
                {title ? (
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                ) : null}
                {children}
            </DialogContent>
        </Dialog>
    );
}
