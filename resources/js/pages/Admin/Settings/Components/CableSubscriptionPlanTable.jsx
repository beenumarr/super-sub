import { styled } from "@mui/material";
import { DataGrid as MuiDataGrid } from "@mui/x-data-grid";
import { memo, useEffect, useState } from "react";
import CableSubscriptionPlanForm from "./CableSubscriptionPlanForm";
import DeleteModal from "@/Components/DeleteModal";

import PrimaryButton from "@/Components/PrimaryButton";
import CableSubscriptionPlanEditForm from "./CableSubscriptionPlanEditForm";
import { cablePlanColumns } from "./CableSubscriptionPlanUtils";

function PlanTypeOption({ data, onChange, field_name, valueSelected, theme }) {
    return (
        <div>
            <input
                className="hidden"
                type="radio"
                name={field_name}
                value={data}
                id={data.name}
                onChange={() => onChange(data)}
            />
            <label
                htmlFor={data.name}
                className={`  text-center flex cursor-pointer  px-4 py-1 m-1 justify-center mx-0.5 rounded-md ${
                    valueSelected === data.id
                        ? " text-gray-800 font-semibold"
                        : "text-gray-400 "
                } `}
            >
                <span className="text-base capitalize  flex">{data.name}</span>
            </label>
        </div>
    );
}

const DataGrid = styled(MuiDataGrid)(({ theme }) => ({
    "& .MuiDataGrid-virtualScroller": { marginTop: "0!important" },
}));

function CablePlanTable({ paginationModel, setPaginationModel, data }) {
    const [rowCountState, setRowCountState] = useState(data?.meta?.total || 0);
    const [formModal, setFormModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: "" });
    const [editFormModal, setEditFormModal] = useState({ show: false, id: "" });

    useEffect(() => {
        setRowCountState((prevRowCountState) =>
            data?.meta?.total !== undefined
                ? data?.meta?.total
                : prevRowCountState
        );
    }, [data?.meta?.total, setRowCountState]);

    const handleCloseDelete = () => {
        setDeleteModal({ show: false, id: "" });
    };

    return (
        <>
            <div className="flex w-full mb-1 justify-end">
                <div className="">
                    <PrimaryButton
                        className="flex truncate"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormModal(true);
                        }}
                    >
                        Add New Plan
                    </PrimaryButton>
                </div>
            </div>

            <DataGrid
                disableColumnFilter
                rows={data.data}
                columns={cablePlanColumns(setEditFormModal, setDeleteModal)}
                rowCount={rowCountState}
                loading={!data}
                pageSizeOptions={[20]}
                paginationModel={paginationModel}
                paginationMode="server"
                onPaginationModelChange={setPaginationModel}
                sx={{
                    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                        outline: "none !important",
                    },
                }}
                disableRowSelectionOnClick
                onRowClick={(data) => {
                    setViewDetailModal({ show: true, id: data.row.id });
                }}
                rowHeight={55}
                headerHeight={40}
            />

            <CableSubscriptionPlanForm
                setFormModal={setFormModal}
                formModal={formModal}
            />
            <CableSubscriptionPlanEditForm
                setFormModal={setEditFormModal}
                formModal={editFormModal}
            />
            <DeleteModal
                deleteModal={deleteModal}
                handleClose={handleCloseDelete}
                deleteRoute="cable_subscription_plans"
                itemType="Cable Plan"
            />
        </>
    );
}

export default memo(CablePlanTable);
