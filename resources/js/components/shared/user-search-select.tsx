import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2, Search, User, Wallet, X } from 'lucide-react';

export interface UserOption {
    id: number;
    name: string;
    email: string;
    phone?: string;
    wallet_balance: number;
}

interface UserSearchSelectProps {
    value: string | number;
    onValueChange: (userId: string, user?: UserOption | null) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}

export function UserSearchSelect({
    value,
    onValueChange,
    placeholder = 'Select a user...',
    error,
    disabled = false,
    className,
}: UserSearchSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchUsers = useCallback(async (query: string) => {
        try {
            setLoading(true);
            const response = await axios.get('/user_search', {
                params: { search: query },
            });
            const data = response.data?.data || response.data || [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to search users:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch when opened
    useEffect(() => {
        if (open) {
            fetchUsers(searchTerm);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open, fetchUsers]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    // Handle debounced search typing
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchTerm(query);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fetchUsers(query);
        }, 250);
    };

    // If an initial value is passed and we have users, resolve selected user
    useEffect(() => {
        if (value && value !== '') {
            const found = users.find((u) => String(u.id) === String(value));
            if (found) {
                setSelectedUser(found);
            } else if (!selectedUser || String(selectedUser.id) !== String(value)) {
                axios
                    .get('/user_search', { params: { search: String(value) } })
                    .then((res) => {
                        const list = res.data?.data || res.data || [];
                        const matched = list.find((u: UserOption) => String(u.id) === String(value));
                        if (matched) {
                            setSelectedUser(matched);
                        }
                    })
                    .catch(() => {});
            }
        } else {
            setSelectedUser(null);
        }
    }, [value, users]);

    const handleSelect = (user: UserOption) => {
        setSelectedUser(user);
        onValueChange(String(user.id), user);
        setOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedUser(null);
        onValueChange('', null);
    };

    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
            {/* Combobox Trigger */}
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={() => {
                    if (!disabled) {
                        setOpen((prev) => !prev);
                    }
                }}
                onKeyDown={(e) => {
                    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setOpen((prev) => !prev);
                    }
                }}
                className={cn(
                    'flex items-center justify-between w-full min-h-10 py-2 px-3 text-left font-normal bg-background hover:bg-muted/50 border border-input rounded-md shadow-xs transition-colors cursor-pointer select-none',
                    error && 'border-red-500 ring-1 ring-red-500',
                    open && 'ring-2 ring-ring border-transparent',
                    disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
                )}
            >
                {selectedUser ? (
                    <div className="flex items-center justify-between w-full pr-1 overflow-hidden">
                        <div className="flex items-center gap-2.5 truncate">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex flex-col truncate text-xs">
                                <span className="font-semibold text-foreground truncate">
                                    {selectedUser.name}{' '}
                                    <span className="text-muted-foreground font-normal">
                                        (#{selectedUser.id})
                                    </span>
                                </span>
                                <span className="text-muted-foreground truncate">
                                    {selectedUser.email || selectedUser.phone || ''}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <Wallet className="h-3 w-3" />₦
                                {Number(selectedUser.wallet_balance || 0).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="Clear selection"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <User className="h-4 w-4 shrink-0 opacity-60" />
                        <span>{placeholder}</span>
                    </div>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>

            {/* Dropdown Content */}
            {open && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 min-w-[320px] rounded-md border border-border bg-popover text-popover-foreground shadow-xl outline-hidden animate-in fade-in-0 zoom-in-95">
                    {/* Search Bar */}
                    <div className="flex items-center border-b px-3 py-2 bg-muted/30">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setOpen(false);
                                } else if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (users.length > 0) {
                                        handleSelect(users[0]);
                                    }
                                }
                            }}
                            placeholder="Search name, email, phone, or ID..."
                            className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                        {loading && <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin text-primary" />}
                    </div>

                    {/* Users List */}
                    <div className="max-h-[260px] overflow-y-auto p-1 divide-y divide-border/40">
                        {users.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {loading ? 'Searching users...' : 'No users found matching query.'}
                            </div>
                        ) : (
                            users.map((u) => {
                                const isSelected = String(u.id) === String(value);
                                return (
                                    <button
                                        type="button"
                                        key={u.id}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSelect(u);
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSelect(u);
                                        }}
                                        className={cn(
                                            'w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                                            isSelected && 'bg-accent/80 font-medium'
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate font-medium text-foreground">
                                                    {u.name}{' '}
                                                    <span className="text-muted-foreground text-xs font-normal">
                                                        (ID: {u.id})
                                                    </span>
                                                </span>
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {u.email} {u.phone ? `• ${u.phone}` : ''}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="text-right">
                                                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                    ₦
                                                    {Number(u.wallet_balance || 0).toLocaleString(undefined, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">Balance</div>
                                            </div>
                                            {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserSearchSelect;
