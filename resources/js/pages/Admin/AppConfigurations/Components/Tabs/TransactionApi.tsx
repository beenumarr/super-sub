import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ConfigItem } from '../ConfigItem';

interface TransactionApiProps {
    data: Record<string, string | number | undefined>;
    handleOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setData: (key: string, value: string) => void;
    monnify_charges_options?: unknown[];
    isSuperAdmin: boolean;
}

const apiTypes = [
    { value: 'Default', name: 'MSORG' },
    { value: 'Smartteck', name: 'Smartteck' },
    { value: 'ADE', name: 'ADE Developers' },
];

export default function TransactionApi({
    data,
    handleOnChange,
    setData,
    isSuperAdmin,
}: TransactionApiProps) {
    return (
        <div className="space-y-4">
            {isSuperAdmin ? (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">API Type</label>
                        <Select
                            value={(data['transaction_api_type'] as string) || 'none'}
                            onValueChange={(v) => setData('transaction_api_type', v === 'none' ? '' : v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Select</SelectItem>
                                {apiTypes.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <ConfigItem
                        label="Transaction Api Url (Enter only url without / example: https://webdata.com)"
                        name="transaction_api_url"
                        value={data['transaction_api_url']}
                        handleOnChange={handleOnChange}
                    />
                </>
            ) : (
                <p className="text-muted-foreground">{data['transaction_api_url']}</p>
            )}
            <ConfigItem
                label="Transaction Api Token"
                name="transaction_api_token"
                value={data['transaction_api_token']}
                handleOnChange={handleOnChange}
            />
        </div>
    );
}
