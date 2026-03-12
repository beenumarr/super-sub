import { Input } from "@/components/ui/input";

export function ConfiItem({ name, label, value, handleOnChange }) {
    return (
        <div className="w-full">
            <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {label}
            </label>
            <Input
                id={name}
                type="text"
                name={name}
                value={value}
                required
                onChange={handleOnChange}
                className="mt-1"
            />
        </div>
    );
}
