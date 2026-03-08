import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Option {
    id: string | number;
    label: string;
    number?: string;
    network?: string;
}

interface AutoSuggestSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchEndpoint: string;
    className?: string;
    disabled?: boolean;
}

export function AutoSuggestSelect({
    value,
    onValueChange,
    placeholder = 'Search...',
    searchEndpoint,
    className,
    disabled = false,
}: AutoSuggestSelectProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();

    // Find the selected option to display its label
    const selectedOption = options.find((option) => option.id.toString() === value);
    const displayValue = selectedOption?.label || (value && value !== 'all' ? `Phone: ${value}` : '');

    // Search function
    const searchPhoneNumbers = useCallback(
        async (query: string) => {
            if (!query || query.length < 3) {
                setOptions([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(searchEndpoint, {
                    params: { query },
                });

                if (response.data.success) {
                    setOptions(response.data.data);
                }
            } catch (error) {
                console.error('Auto-suggest search failed:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        },
        [searchEndpoint],
    );

    // Debounced search function
    const debouncedSearch = useCallback(
        (query: string) => {
            // Clear existing timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            // Set new timeout
            debounceTimeoutRef.current = setTimeout(() => {
                searchPhoneNumbers(query);
            }, 300);
        },
        [searchPhoneNumbers],
    );

    // Handle search input change
    const handleSearchChange = useCallback(
        (query: string) => {
            setSearchValue(query);
            if (query.length >= 3) {
                setLoading(true);
                debouncedSearch(query);
            } else {
                setOptions([]);
                setLoading(false);
            }
        },
        [debouncedSearch],
    );

    // Handle option selection
    const handleSelect = (optionId: string) => {
        onValueChange(optionId === value ? 'all' : optionId);
        setOpen(false);
        setSearchValue('');
    };

    // Clear selection
    const handleClear = () => {
        onValueChange('all');
        setSearchValue('');
        setOptions([]);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className={cn('justify-between', className)} disabled={disabled}>
                    <span className="truncate">{displayValue || placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput placeholder="Type to search phone numbers..." value={searchValue} onValueChange={handleSearchChange} />
                    <CommandList>
                        {/* Show loading state */}
                        {loading && (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-muted-foreground ml-2 text-sm">Searching...</span>
                            </div>
                        )}

                        {/* Show clear option if there's a selection */}
                        {value && value !== 'all' && (
                            <CommandGroup>
                                <CommandItem value="clear" onSelect={handleClear} className="text-muted-foreground">
                                    Clear selection
                                </CommandItem>
                            </CommandGroup>
                        )}

                        {/* Show search results */}
                        {!loading && options.length > 0 && (
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem key={option.id} value={option.id.toString()} onSelect={() => handleSelect(option.id.toString())}>
                                        <Check className={cn('mr-2 h-4 w-4', value === option.id.toString() ? 'opacity-100' : 'opacity-0')} />
                                        <div className="flex flex-col">
                                            <span>{option.label}</span>
                                            {option.network && <span className="text-muted-foreground text-xs">{option.network}</span>}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {/* Show empty state */}
                        {!loading && searchValue.length >= 3 && options.length === 0 && (
                            <CommandEmpty>
                                No phone numbers found.
                                <div className="text-muted-foreground mt-1 text-xs">Try a different search term.</div>
                            </CommandEmpty>
                        )}

                        {/* Show instruction when no search */}
                        {!loading && searchValue.length < 3 && options.length === 0 && (
                            <div className="text-muted-foreground py-6 text-center text-sm">Type at least 3 characters to search</div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
