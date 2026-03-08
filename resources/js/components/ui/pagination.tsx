import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links?: PaginationLink[]; // Make links optional since it might be separate
    path: string;
    per_page: number;
    to: number;
    total: number;
}

interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

interface PaginationProps {
    meta: PaginationMeta;
    links: PaginationLinks;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    className?: string;
}

export function Pagination({ meta, links, onPageChange, isLoading = false, className }: PaginationProps) {
    if (meta.last_page <= 1) {
        return null;
    }

    const handlePageChange = (page: number) => {
        if (page < 1 || page > meta.last_page || page === meta.current_page || isLoading) {
            return;
        }
        onPageChange(page);
    };

    // Use meta.links if available, otherwise generate simple pagination
    const pageLinks = meta.links || [];

    return (
        <div className={cn("mt-6 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 dark:border-gray-700", className)}>
            {/* Mobile pagination */}
            <div className="flex flex-1 justify-between sm:hidden">
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    disabled={!links.prev || isLoading}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    disabled={!links.next || isLoading}
                >
                    Next
                </Button>
            </div>

            {/* Desktop pagination */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Showing <span className="font-medium">{meta.from}</span> to{' '}
                        <span className="font-medium">{meta.to}</span> of{' '}
                        <span className="font-medium">{meta.total}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex space-x-2 rounded-md shadow-sm" aria-label="Pagination">
                        {/* Previous button */}
                        <Button
                            variant="outline"
                            className="rounded-l-md px-2"
                            onClick={() => handlePageChange(meta.current_page - 1)}
                            disabled={!links.prev || isLoading}
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </Button>

                        {/* Page numbers */}
                        {pageLinks.length > 0 ? (
                            pageLinks
                                .filter((link) => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;')
                                .map((link, index) => {
                                    if (link.label === '...') {
                                        return (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                                            >
                                                ...
                                            </span>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={link.label}
                                            variant={link.active ? 'default' : 'outline'}
                                            className={cn(
                                                'px-4 py-2',
                                                link.active && 'bg-theme-1 hover:bg-theme-1/90 text-white',
                                            )}
                                            onClick={() => handlePageChange(parseInt(link.label))}
                                            disabled={isLoading}
                                        >
                                            {link.label}
                                        </Button>
                                    );
                                })
                        ) : (
                            // Simple pagination fallback when no page links available
                            <>
                                {meta.current_page > 1 && (
                                    <Button
                                        variant="outline"
                                        className="px-4 py-2"
                                        onClick={() => handlePageChange(1)}
                                        disabled={isLoading}
                                    >
                                        1
                                    </Button>
                                )}
                                {meta.current_page > 2 && (
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        ...
                                    </span>
                                )}
                                <Button
                                    variant="default"
                                    className="bg-theme-1 hover:bg-theme-1/90 text-white px-4 py-2"
                                    disabled
                                >
                                    {meta.current_page}
                                </Button>
                                {meta.current_page < meta.last_page - 1 && (
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        ...
                                    </span>
                                )}
                                {meta.current_page < meta.last_page && (
                                    <Button
                                        variant="outline"
                                        className="px-4 py-2"
                                        onClick={() => handlePageChange(meta.last_page)}
                                        disabled={isLoading}
                                    >
                                        {meta.last_page}
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Next button */}
                        <Button
                            variant="outline"
                            className="rounded-r-md px-2"
                            onClick={() => handlePageChange(meta.current_page + 1)}
                            disabled={!links.next || isLoading}
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
