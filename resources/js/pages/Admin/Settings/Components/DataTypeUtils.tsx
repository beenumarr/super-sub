import { Edit2, Trash2 } from "lucide-react";
import { FC } from "react";

interface DataTypeRow {
    id: number;
    name: string;
    network: {
        name: string;
    };
    active: boolean;
}

interface EditPlanProps {
    onClick: (e: React.MouseEvent) => void;
}

interface MobileNetworkProps {
    row: DataTypeRow;
}

interface StatusProps {
    row: DataTypeRow;
}

export const EditPlan: FC<EditPlanProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="Edit"
        >
            <Edit2 className="h-4 w-4" />
        </button>
    );
};

export const DeletePlan: FC<EditPlanProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-600"
            title="Delete"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
};

export const MobileNetwork: FC<MobileNetworkProps> = ({ row }) => {
    return (
        <div className="flex uppercase text-start p-2 flex-col">
            {row.network?.name || "N/A"}
        </div>
    );
};

export const Status: FC<StatusProps> = ({ row }) => {
    return (
        <div className="flex uppercase text-start p-2 flex-col">
            {row.active ? "Active" : "Disabled"}
        </div>
    );
};
