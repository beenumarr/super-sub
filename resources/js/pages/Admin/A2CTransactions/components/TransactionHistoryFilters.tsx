import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard } from "lucide-react";
import { memo } from "react";

const statusOptions = [
    {
        id: "",
        name: "All Status",
    },
    {
        id: "processing",
        name: "Processing",
    },
    {
        id: "completed",
        name: "Completed",
    },
    {
        id: "failed",
        name: "Failed",
    },
    {
        id: "transferred",
        name: "Transferred",
    },
];

interface TransactionHistoryFiltersProps {
    setFilter: (filters: any) => void;
    filters: any;
    disableStatus?: boolean;
}

function TransactionHistoryFilters({
    setFilter,
    filters,
    disableStatus = false,
}: TransactionHistoryFiltersProps): JSX.Element {
    return (
        <div className="flex gap-3 items-center">
            {!disableStatus && (
                <Select value={filters.status} onValueChange={(val) =>
                    setFilter({
                        ...filters,
                        status: val,
                    })
                }>
                    <SelectTrigger className="w-48">
                        <CreditCard className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.filter(option => option.id).map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}

export default memo(TransactionHistoryFilters);
