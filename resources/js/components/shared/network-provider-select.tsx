import InputError from '@/components/input-error';
import { NetworkIcon } from '@/components/shared/network-icon';

interface NetworkProviderSelectProps<TNetwork = any> {
    label?: string;
    networks: TNetwork[];
    selectedId: string | number;
    getId: (network: TNetwork) => string | number;
    getName: (network: TNetwork) => string;
    getIsActive: (network: TNetwork) => boolean;
    onSelect: (network: TNetwork) => void;
    error?: string;
    centerError?: boolean;
}

export function NetworkProviderSelect<TNetwork = any>({
    label = 'Network Provider',
    networks,
    selectedId,
    getId,
    getName,
    getIsActive,
    onSelect,
    error,
    centerError = false,
}: NetworkProviderSelectProps<TNetwork>) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="bg-accent/40 border-border flex flex-wrap items-center justify-center gap-3 rounded-md border p-3">
                {networks.map((network, i) => {
                    const id = getId(network);
                    const name = getName(network);
                    const isSelected = selectedId === id;
                    const isActive = getIsActive(network);

                    return (
                        <button
                            key={String(id) ?? i}
                            type="button"
                            disabled={!isActive}
                            onClick={() => onSelect(network)}
                            aria-label={name}
                            title={name}
                            className={`flex w-18 flex-col items-center justify-center rounded-md border py-2 text-center text-[11px] font-medium uppercase transition-colors ${
                                isActive
                                    ? isSelected
                                        ? 'border-theme-1 bg-theme-1/10 text-theme-1 dark:border-gray-100 dark:bg-gray-100 dark:text-slate-900'
                                        : 'hover:border-theme-1 hover:bg-theme-1/10 hover:text-theme-1 dark:hover:bg-theme-1/10 dark:hover:text-theme-1 dark:bg-accent/40 border-gray-200 bg-white text-gray-700 dark:border-slate-700 dark:text-gray-100 dark:hover:border-slate-500'
                                    : 'dark:bg-accent/40 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 opacity-60 dark:border-gray-700'
                            }`}
                        >
                            <div className="mb-1 flex items-center justify-center">
                                <NetworkIcon network={name} />
                            </div>
                            <span className="mt-1 truncate">{name}</span>
                        </button>
                    );
                })}
            </div>
            <InputError message={error} className={`mt-2 text-xs text-red-500 ${centerError ? 'text-center' : ''}`} />
        </div>
    );
}
