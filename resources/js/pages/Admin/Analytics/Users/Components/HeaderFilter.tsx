import { Input } from "@/components/ui/input";
import { memo } from "react";

interface HeaderFilterProps {
    setFilter: (filters: any) => void;
    filters: any;
    total: number;
}

function HeaderFilter({ setFilter, filters, total }: HeaderFilterProps) {
    return (
        <div className="flex w-full gap-3 max-w-screen-md items-center">
            <Input
                className="w-full md:w-64"
                placeholder="Search by phone, name, or email..."
                onChange={(e) =>
                    setFilter({
                        ...filters,
                        search: e.target.value,
                    })
                }
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Total: {total}
            </span>
        </div>
    );
}

export default memo(HeaderFilter);
