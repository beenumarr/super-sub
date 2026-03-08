import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeTogle() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <button
            onClick={() => updateAppearance(appearance === 'light' ? 'dark' : 'light')}
            className={cn(
                'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full p-1 transition-colors hover:bg-neutral-100 hover:dark:bg-neutral-800',
                appearance === 'dark'
                    ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                    : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
            )}
        >
            {appearance === 'dark' ? (
                <>
                    <Sun className="h-4 w-4" />
                </>
            ) : (
                <>
                    <Moon className="h-4 w-4" />
                </>
            )}
        </button>
    );
}
