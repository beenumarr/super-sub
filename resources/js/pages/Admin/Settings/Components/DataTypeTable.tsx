import { memo, useState, FC } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import DataPlanTypeForm from "./DataPlanTypeForm";
import DataPlanTypeEditForm from "./DataPlanTypeEditForm";
import { router } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface MobileNetwork {
    id: number;
    name: string;
}

interface DataType {
    id: number;
    name: string;
    network: MobileNetwork;
    active: boolean;
}

interface DataTypeTableProps {
    data: DataType[];
    enable_add_datatype: boolean;
    filterValues?: any;
    setFilterValue?: (val: any) => void;
    planTypes?: any[];
    theme?: string;
}

interface FormModal {
    show: boolean;
    id: string | number;
}

const DataTypeTable: FC<DataTypeTableProps> = ({ data, enable_add_datatype }) => {
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState<FormModal>({ show: false, id: "" });
    const [editFormModal, setEditFormModal] = useState<FormModal>({ show: false, id: "" });

    const handleCloseDelete = () => {
        setDeleteModal({ show: false, id: "" });
    };

    return (
        <>
            <div className="flex w-full mb-4 justify-end">
                {enable_add_datatype && (
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Add New Data Type
                    </Button>
                )}
            </div>

            <div className="rounded-lg border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Network</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-24 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data && data.length > 0 ? (
                            data.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="font-medium">{row.name}</TableCell>
                                    <TableCell>
                                        <span className="uppercase text-sm">{row.network?.name || "N/A"}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={row.active ? "bg-green-600" : "bg-gray-500"}>
                                            {row.active ? "Active" : "Disabled"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="flex gap-2 justify-center">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setEditFormModal({ show: true, id: row.id });
                                            }}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setDeleteModal({ show: true, id: row.id });
                                            }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    No data types found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataPlanTypeForm
                setFormModal={setFormModal}
                formModal={formModal}
            />
            <DataPlanTypeEditForm
                setFormModal={setEditFormModal}
                formModal={editFormModal}
            />
            <Dialog open={deleteModal.show} onOpenChange={(open) => !open && handleCloseDelete()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Data Type</DialogTitle>
                    </DialogHeader>
                    <div>Are you sure you want to delete this data type? This action cannot be undone.</div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDelete}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                router.delete(
                                    route("data_plan_types.destroy", deleteModal.id),
                                    {
                                        onSuccess: () => {
                                            handleCloseDelete();
                                        },
                                    }
                                );
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default memo(DataTypeTable);
