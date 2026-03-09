import { styled } from "@mui/material";
import { DataGrid as MuiDataGrid } from "@mui/x-data-grid";
import { memo, useEffect, useState } from "react";
import DataPlanTypeForm from "./DataPlanTypeForm";
import DataPlanTypeEditForm from "./DataPlanTypeEditForm";
import DeleteModal from "@/Components/DeleteModal";

import PrimaryButton from "@/Components/PrimaryButton";
import { dataTypeColumns } from "./DataTypeUtils";

const DataGrid = styled(MuiDataGrid)(({ theme }) => ({
    "& .MuiDataGrid-virtualScroller": { marginTop: "0!important" },
}));

function DataTypeTable({ data, enable_add_datatype }) {
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: "" });
    const [editFormModal, setEditFormModal] = useState({ show: false, id: "" });

    const handleCloseDelete = () => {
        setDeleteModal({ show: false, id: "" });
    };

    return (
        <>
            <div className="flex w-full mb-1 justify-end">
                <div className="">
                    {enable_add_datatype && (
                        <PrimaryButton
                            className="flex truncate"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setFormModal(true);
                            }}
                        >
                            Add New Data Type
                        </PrimaryButton>
                    )}
                </div>
            </div>

            <DataGrid
                disableColumnFilter
                rows={data}
                columns={dataTypeColumns(setEditFormModal, setDeleteModal)}
                loading={!data}
                paginationMode="server"
                sx={{
                    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                        outline: "none !important",
                    },
                }}
                disableRowSelectionOnClick
                rowHeight={55}
                headerHeight={40}
            />

            <DataPlanTypeForm
                setFormModal={setFormModal}
                formModal={formModal}
            />
            <DataPlanTypeEditForm
                setFormModal={setEditFormModal}
                formModal={editFormModal}
            />
            <DeleteModal
                deleteModal={deleteModal}
                handleClose={handleCloseDelete}
                deleteRoute="data_plan_types"
                itemType="Data Type"
            />
        </>
    );
}

export default memo(DataTypeTable);
