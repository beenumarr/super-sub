import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface WelcomeAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    showOnce?: boolean;
}

export function WelcomeAnnouncementModal({ isOpen, onClose, title, content, showOnce = true }: WelcomeAnnouncementModalProps) {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        // Always show if isOpen is true (server-side controls when to show)
        if (isOpen) {
            setShouldShow(true);
        }
    }, [isOpen, showOnce]);

    const handleClose = () => {
        // No need to set sessionStorage since server controls when to show
        setShouldShow(false);
        onClose();
    };

    if (!shouldShow) {
        return null;
    }

    return (
        <Dialog open={shouldShow} onOpenChange={handleClose}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
                    </div>
                </DialogHeader>

                <DialogDescription asChild>
                    <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                // Custom styling for markdown elements
                                h1: ({ children }) => <h1 className="mb-4 text-2xl font-bold">{children}</h1>,
                                h2: ({ children }) => <h2 className="mb-3 text-xl font-semibold">{children}</h2>,
                                h3: ({ children }) => <h3 className="mb-2 text-lg font-medium">{children}</h3>,
                                p: ({ children }) => <p className="mb-3 text-gray-700 dark:text-gray-300">{children}</p>,
                                ul: ({ children }) => <ul className="mb-3 ml-6 list-disc space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-3 ml-6 list-decimal space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                code: ({ children }) => (
                                    <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm dark:bg-gray-800">{children}</code>
                                ),
                                pre: ({ children }) => (
                                    <pre className="mb-3 overflow-x-auto rounded-lg bg-gray-100 p-3 dark:bg-gray-800">{children}</pre>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="my-4 border-l-4 border-blue-500 pl-4 text-gray-600 italic dark:text-gray-400">
                                        {children}
                                    </blockquote>
                                ),
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {children}
                                    </a>
                                ),
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </DialogDescription>

                <DialogFooter>
                    <Button onClick={handleClose} className="w-full sm:w-auto">
                        Got it, thanks!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
