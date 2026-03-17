import React, { FC, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DateRangeFilterProps {
    from: string;
    to: string;
    onDateChange: (from: string, to: string) => void;
}

const DateRangeFilter: FC<DateRangeFilterProps> = ({ from, to, onDateChange }) => {
    const [customMode, setCustomMode] = useState(false);

    const getDateRange = (preset: string): { from: string; to: string } => {
        const today = new Date();
        const fromDate = new Date();
        const toDate = new Date();

        switch (preset) {
            case 'today':
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(23, 59, 59, 999);
                break;
            case 'yesterday':
                fromDate.setDate(today.getDate() - 1);
                fromDate.setHours(0, 0, 0, 0);
                toDate.setDate(today.getDate() - 1);
                toDate.setHours(23, 59, 59, 999);
                break;
            case 'lastWeek':
                const firstDay = new Date(today);
                firstDay.setDate(today.getDate() - today.getDay() - 7);
                firstDay.setHours(0, 0, 0, 0);
                const lastDay = new Date(firstDay);
                lastDay.setDate(firstDay.getDate() + 6);
                lastDay.setHours(23, 59, 59, 999);
                return {
                    from: firstDay.toISOString().split('T')[0],
                    to: lastDay.toISOString().split('T')[0],
                };
            case 'lastMonth':
                fromDate.setMonth(today.getMonth() - 1);
                fromDate.setDate(1);
                fromDate.setHours(0, 0, 0, 0);
                toDate.setMonth(today.getMonth() - 1);
                toDate.setDate(new Date(today.getFullYear(), today.getMonth(), 0).getDate());
                toDate.setHours(23, 59, 59, 999);
                break;
            case 'thisMonth':
                fromDate.setDate(1);
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(23, 59, 59, 999);
                break;
            default:
                return { from: '', to: '' };
        }

        return {
            from: fromDate.toISOString().split('T')[0],
            to: toDate.toISOString().split('T')[0],
        };
    };

    const handlePresetClick = (preset: string) => {
        const dateRange = getDateRange(preset);
        onDateChange(dateRange.from, dateRange.to);
        setCustomMode(false);
    };

    const handleCustomClick = () => {
        setCustomMode(!customMode);
    };

    const handleClearDates = () => {
        onDateChange('', '');
    };

    const isPresetSelected = (preset: string): boolean => {
        const range = getDateRange(preset);
        return from === range.from;
    };

    return (
        <div className="space-y-3">
            {/* Quick Select & Custom Button */}
            <div className="flex flex-wrap gap-2">
                {['Today', 'Yesterday', 'Last Week', 'Last Month', 'This Month'].map((label, idx) => {
                    const presetKeys = ['today', 'yesterday', 'lastWeek', 'lastMonth', 'thisMonth'];
                    return (
                        <Button
                            key={presetKeys[idx]}
                            variant={isPresetSelected(presetKeys[idx]) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePresetClick(presetKeys[idx])}
                        >
                            {label}
                        </Button>
                    );
                })}
                <Button
                    variant={customMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleCustomClick}
                >
                    Custom
                </Button>
                {(from || to) && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearDates}
                        className="text-red-500 hover:text-red-600"
                    >
                        Clear
                    </Button>
                )}
            </div>

            {/* Custom Date Range Inputs */}
            {customMode && (
                <div className="flex flex-col md:flex-row gap-3 pt-2">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5">From</label>
                        <Input
                            type="date"
                            value={from}
                            onChange={(e) => onDateChange(e.target.value, to)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5">To</label>
                        <Input
                            type="date"
                            value={to}
                            onChange={(e) => onDateChange(from, e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangeFilter;
